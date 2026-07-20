<?php

namespace App\Http\Controllers;

use App\Mail\SaleMail;
use Illuminate\Http\Request;
use App\Models\Sale\Sale;
use App\Models\Sale\SaleDetail;
use App\Models\Product\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class MobileCheckoutController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            "items" => "required|array|min:1",
            "items.*.product_id" => "required|integer|exists:products,id",
            "items.*.quantity" => "required|integer|min:1",
            "items.*.price" => "nullable|numeric|min:0",
            "total" => "required|numeric|min:0",
            "method_payment" => "nullable|in:MOBILE_MANUAL,PAYPAL,CARD",
        ]);

        $user = auth("api")->user();
        $methodPayment = $validated["method_payment"] ?? "mobile";

        DB::beginTransaction();

        try {
            $requestedItems = collect($validated["items"])
                ->groupBy("product_id")
                ->map(fn ($items) => $items->sum("quantity"));

            $products = Product::whereIn("id", $requestedItems->keys())
                ->lockForUpdate()
                ->get()
                ->keyBy("id");

            $saleItems = [];
            $total = 0;

            foreach ($requestedItems as $productId => $quantity) {
                $product = $products->get($productId);

                if (!$product) {
                    throw ValidationException::withMessages([
                        "items" => ["Uno de los productos ya no está disponible."],
                    ]);
                }

                if ($quantity > $product->stock) {
                    throw ValidationException::withMessages([
                        "items" => ["Stock insuficiente para {$product->title}."],
                    ]);
                }

                if (!is_numeric($product->price_eur)) {
                    throw ValidationException::withMessages([
                        "items" => ["El producto {$product->title} no tiene un precio válido."],
                    ]);
                }

                $price = (float) $product->price_eur;
                $subtotal = round($price * $quantity, 2);
                $total += $subtotal;
                $saleItems[] = compact("product", "quantity", "price", "subtotal");
            }

            $total = round($total, 2);

            $sale = Sale::create([
                "user_id" => $user->id,
                "method_payment" => $methodPayment,
                "currency_total" => "EUR",
                "currency_payment" => "EUR",
                "discount" => 0,
                "subtotal" => $total,
                "total" => $total,
                "price_dolar" => 1,
                "description" => "Pedido realizado desde la app móvil",
                "n_transaccion" => "MOBILE-" . time(),
                "status" => "pending_payment",
            ]);

            foreach ($saleItems as $item) {
                SaleDetail::create([
                    "sale_id" => $sale->id,
                    "product_id" => $item["product"]->id,
                    "quantity" => $item["quantity"],
                    "price_unit" => $item["price"],
                    "subtotal" => $item["subtotal"],
                    "total" => $item["subtotal"],
                    "currency" => "EUR",
                    "discount" => 0,
                ]);

                $item["product"]->update([
                    "stock" => $item["product"]->stock - $item["quantity"],
                ]);
            }

            DB::commit();

            $this->sendSaleConfirmationMail($sale, $user);

            return response()->json([
                "message" => 200,
                "message_text" => "Pedido realizado correctamente",
                "sale_id" => $sale->id,
            ]);

        } catch (ValidationException $e) {
            DB::rollBack();
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                "message" => 500,
                "message_text" => "Error al crear el pedido",
                "error" => $e->getMessage(),
            ], 500);
        }
    }

    private function sendSaleConfirmationMail(?Sale $sale, $user): void
    {
        if (! $sale) {
            Log::warning("No se pudo enviar el correo de confirmacion movil: la venta no pudo recargarse.");

            return;
        }

        if (! filter_var($user->email ?? null, FILTER_VALIDATE_EMAIL)) {
            Log::warning("No se pudo enviar el correo de confirmacion movil para la venta {$sale->id}: usuario sin email valido.");

            return;
        }

        try {
            $sale = $sale->fresh() ?: $sale;
            $sale->loadMissing([
                "sale_addres",
                "sale_details.product",
                "sale_details.product_variation.attribute",
                "sale_details.product_variation.propertie",
                "sale_details.product_variation.variation_father.attribute",
                "sale_details.product_variation.variation_father.propertie",
            ]);

            Mail::to($user->email)->send(new SaleMail($user, $sale));
        } catch (\Throwable $exception) {
            Log::error("No se pudo enviar el correo de confirmacion movil para la venta {$sale->id}. Excepcion: ".get_class($exception));
        }
    }
}
