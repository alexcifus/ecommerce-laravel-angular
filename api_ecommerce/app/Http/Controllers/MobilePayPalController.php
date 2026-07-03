<?php

namespace App\Http\Controllers;

use App\Models\Product\Product;
use App\Models\Sale\Sale;
use App\Models\Sale\SaleDetail;
use App\Services\PayPalService;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Throwable;

class MobilePayPalController extends Controller
{
    public function createOrder(Request $request, PayPalService $payPalService): JsonResponse
    {
        $validated = $request->validate([
            'client_request_id' => 'required|uuid',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $user = auth('api')->user();
        $sale = Sale::where('user_id', $user->id)
            ->where('payment_request_id', $validated['client_request_id'])
            ->first();

        if (! $sale) {
            try {
                $sale = DB::transaction(function () use ($validated, $user) {
                    $existingSale = Sale::where('user_id', $user->id)
                        ->where('payment_request_id', $validated['client_request_id'])
                        ->lockForUpdate()
                        ->first();

                    if ($existingSale) {
                        return $existingSale;
                    }

                    $saleItems = $this->buildSaleItems($validated['items']);
                    $total = round(collect($saleItems)->sum('subtotal'), 2);

                    if ($total <= 0) {
                        throw ValidationException::withMessages([
                            'items' => ['El total del pedido debe ser mayor que cero.'],
                        ]);
                    }

                    $sale = Sale::create([
                        'user_id' => $user->id,
                        'method_payment' => 'PAYPAL',
                        'currency_total' => 'EUR',
                        'currency_payment' => 'EUR',
                        'discount' => 0,
                        'subtotal' => $total,
                        'total' => $total,
                        'price_dolar' => 1,
                        'description' => 'Pedido PayPal iniciado desde la app móvil',
                        'n_transaccion' => 'PAYPAL-'.$validated['client_request_id'],
                        'status' => 'pending_payment',
                        'payment_request_id' => $validated['client_request_id'],
                    ]);

                    foreach ($saleItems as $item) {
                        SaleDetail::create([
                            'sale_id' => $sale->id,
                            'product_id' => $item['product']->id,
                            'quantity' => $item['quantity'],
                            'price_unit' => $item['price'],
                            'subtotal' => $item['subtotal'],
                            'total' => $item['subtotal'],
                            'currency' => 'EUR',
                            'discount' => 0,
                        ]);
                    }

                    return $sale;
                });
            } catch (QueryException $exception) {
                $sale = Sale::where('user_id', $user->id)
                    ->where('payment_request_id', $validated['client_request_id'])
                    ->first();

                if (! $sale) {
                    throw $exception;
                }
            }
        }

        if ($sale->method_payment !== 'PAYPAL') {
            return response()->json([
                'message' => 409,
                'message_text' => 'El identificador de petición ya pertenece a otro pago.',
            ], 409);
        }

        if (! $sale->paypal_order_id) {
            try {
                $order = $payPalService->createOrder(
                    $this->formatAmount($sale->total),
                    'EUR',
                    'mobile-create-'.$sale->payment_request_id,
                    $sale->id
                );

                $sale->update([
                    'paypal_order_id' => $order['id'],
                ]);
            } catch (RuntimeException $exception) {
                report($exception);

                return response()->json([
                    'message' => 502,
                    'message_text' => 'No se pudo crear la orden en PayPal Sandbox.',
                    'sale_id' => $sale->id,
                ], 502);
            }
        }

        return response()->json([
            'message' => 200,
            'message_text' => 'Orden PayPal creada correctamente',
            'sale_id' => $sale->id,
            'paypal_order_id' => $sale->paypal_order_id,
            'amount' => $this->formatAmount($sale->total),
            'currency' => 'EUR',
            'status' => $sale->status,
        ]);
    }

    public function capture(
        string $paypalOrderId,
        PayPalService $payPalService
    ): JsonResponse {
        $user = auth('api')->user();
        $sale = Sale::where('user_id', $user->id)
            ->where('method_payment', 'PAYPAL')
            ->where('paypal_order_id', $paypalOrderId)
            ->first();

        if (! $sale) {
            return response()->json([
                'message' => 404,
                'message_text' => 'No se encontró la orden PayPal para este usuario.',
            ], 404);
        }

        if ($sale->status === 'paid') {
            return $this->paidResponse($sale, true);
        }

        $idempotent = false;

        try {
            $sale = DB::transaction(function () use (
                $sale,
                $paypalOrderId,
                $payPalService,
                &$idempotent
            ) {
                $lockedSale = Sale::whereKey($sale->id)->lockForUpdate()->firstOrFail();

                if ($lockedSale->status === 'paid') {
                    $idempotent = true;

                    return $lockedSale;
                }

                $quantities = SaleDetail::where('sale_id', $lockedSale->id)
                    ->get()
                    ->groupBy('product_id')
                    ->map(fn ($details) => $details->sum('quantity'));

                if ($quantities->isEmpty()) {
                    throw ValidationException::withMessages([
                        'items' => ['El pedido no contiene productos.'],
                    ]);
                }

                $products = Product::whereIn('id', $quantities->keys())
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                foreach ($quantities as $productId => $quantity) {
                    $product = $products->get($productId);

                    if (! $product) {
                        throw ValidationException::withMessages([
                            'items' => ['Uno de los productos ya no está disponible.'],
                        ]);
                    }

                    if ($quantity > $product->stock) {
                        throw ValidationException::withMessages([
                            'items' => ["Stock insuficiente para {$product->title}."],
                        ]);
                    }
                }

                $order = $payPalService->captureOrder(
                    $paypalOrderId,
                    'mobile-capture-'.$lockedSale->payment_request_id
                );
                $capture = $this->completedCapture($order);
                $this->validateCaptureAmount($capture, $lockedSale);

                foreach ($quantities as $productId => $quantity) {
                    $product = $products->get($productId);
                    $product->update([
                        'stock' => $product->stock - $quantity,
                    ]);
                }

                $lockedSale->update([
                    'status' => 'paid',
                    'paypal_capture_id' => $capture['id'],
                    'n_transaccion' => $capture['id'],
                ]);

                return $lockedSale->fresh();
            }, 3);
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (RuntimeException $exception) {
            report($exception);

            return response()->json([
                'message' => 502,
                'message_text' => 'PayPal no confirmó correctamente la captura del pago.',
                'sale_id' => $sale->id,
                'status' => $sale->status,
            ], 502);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 500,
                'message_text' => 'No se pudo completar el pedido PayPal.',
                'sale_id' => $sale->id,
                'status' => $sale->status,
            ], 500);
        }

        return $this->paidResponse($sale, $idempotent);
    }

    private function buildSaleItems(array $items): array
    {
        $requestedItems = collect($items)
            ->groupBy('product_id')
            ->map(fn ($productItems) => $productItems->sum('quantity'));

        $products = Product::whereIn('id', $requestedItems->keys())
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        $saleItems = [];

        foreach ($requestedItems as $productId => $quantity) {
            $product = $products->get($productId);

            if (! $product) {
                throw ValidationException::withMessages([
                    'items' => ['Uno de los productos ya no está disponible.'],
                ]);
            }

            if ($quantity > $product->stock) {
                throw ValidationException::withMessages([
                    'items' => ["Stock insuficiente para {$product->title}."],
                ]);
            }

            if (! is_numeric($product->price_eur)) {
                throw ValidationException::withMessages([
                    'items' => ["El producto {$product->title} no tiene un precio válido."],
                ]);
            }

            $price = (float) $product->price_eur;
            $subtotal = round($price * $quantity, 2);
            $saleItems[] = compact('product', 'quantity', 'price', 'subtotal');
        }

        return $saleItems;
    }

    private function completedCapture(array $order): array
    {
        if (($order['status'] ?? null) !== 'COMPLETED') {
            throw new RuntimeException('La orden PayPal no está completada.');
        }

        foreach ($order['purchase_units'] ?? [] as $purchaseUnit) {
            foreach (data_get($purchaseUnit, 'payments.captures', []) as $capture) {
                if (($capture['status'] ?? null) === 'COMPLETED' && ! empty($capture['id'])) {
                    return $capture;
                }
            }
        }

        throw new RuntimeException('PayPal no devolvió una captura completada.');
    }

    private function validateCaptureAmount(array $capture, Sale $sale): void
    {
        $currency = strtoupper((string) data_get($capture, 'amount.currency_code'));
        $amount = data_get($capture, 'amount.value');

        if ($currency !== 'EUR') {
            throw new RuntimeException('La moneda capturada por PayPal no coincide con EUR.');
        }

        if (! is_numeric($amount) || $this->toCents($amount) !== $this->toCents($sale->total)) {
            throw new RuntimeException('El importe capturado por PayPal no coincide con la venta.');
        }
    }

    private function paidResponse(Sale $sale, bool $idempotent = false): JsonResponse
    {
        return response()->json([
            'message' => 200,
            'message_text' => $idempotent
                ? 'El pedido PayPal ya estaba pagado'
                : 'Pago PayPal confirmado y pedido actualizado',
            'sale_id' => $sale->id,
            'paypal_order_id' => $sale->paypal_order_id,
            'paypal_capture_id' => $sale->paypal_capture_id,
            'n_transaccion' => $sale->n_transaccion,
            'amount' => $this->formatAmount($sale->total),
            'currency' => 'EUR',
            'status' => 'paid',
            'idempotent' => $idempotent,
        ]);
    }

    private function formatAmount(mixed $amount): string
    {
        return number_format((float) $amount, 2, '.', '');
    }

    private function toCents(mixed $amount): int
    {
        return (int) round(((float) $amount) * 100);
    }
}
