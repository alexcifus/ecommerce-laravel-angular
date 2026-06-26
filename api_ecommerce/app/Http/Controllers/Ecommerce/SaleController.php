<?php

namespace App\Http\Controllers\Ecommerce;

use App\Mail\SaleMail;
use App\Models\Sale\Cart;
use App\Models\Sale\Sale;
use Illuminate\Http\Request;
use App\Models\Product\Product;
use App\Models\Sale\SaleAddres;
use App\Models\Sale\SaleDetail;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Models\Product\ProductVariation;
use App\Http\Resources\Ecommerce\Sale\SaleResource;
use App\Http\Resources\Ecommerce\Sale\SaleCollection;

class SaleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    public function orders()
    {
        $user = auth("api")->user();

        $sales = Sale::where("user_id", $user->id)->orderBy("id", "desc")->get();

        return response()->json([
            "sales" => SaleCollection::make($sales),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            "method_payment" => "required|string",
            "currency_total" => "required|string",
            "currency_payment" => "required|string",
            "discount" => "required|numeric|min:0",
            "subtotal" => "required|numeric|min:0",
            "total" => "required|numeric|min:0",
            "price_dolar" => "nullable|numeric|min:0",
            "payment_status" => "nullable|string",
            "paypal_order_id" => "nullable|string",
            "description" => "nullable|string",
            "n_transaccion" => "required|string",
            "sale_address" => "required|array",
            "sale_address.name" => "required|string",
            "sale_address.surname" => "required|string",
            "sale_address.company" => "nullable|string",
            "sale_address.country_region" => "required|string",
            "sale_address.city" => "required|string",
            "sale_address.address" => "required|string",
            "sale_address.street" => "required|string",
            "sale_address.postcode_zip" => "required|string",
            "sale_address.phone" => "required|string",
            "sale_address.email" => "required|email",
        ]);

        $user = auth("api")->user();
        $carts = Cart::where("user_id", $user->id)->get();

        if ($carts->isEmpty()) {
            return response()->json([
                "message" => 422,
                "message_text" => "El carrito de compra esta vacio",
            ], 422);
        }

        $status = $request->method_payment === "PAYPAL" && $request->payment_status === "paid"
            ? "paid"
            : "pending_payment";

        $sale = DB::transaction(function () use ($request, $user, $carts, $status) {
            $sale = Sale::create([
                "user_id" => $user->id,
                "method_payment" => $request->method_payment,
                "currency_total" => $request->currency_total,
                "currency_payment" => $request->currency_payment,
                "discount" => $request->discount,
                "subtotal" => $request->subtotal,
                "total" => $request->total,
                "price_dolar" => $request->price_dolar ?? 0,
                "description" => $request->description,
                "n_transaccion" => $request->n_transaccion,
                "status" => $status,
            ]);

            foreach ($carts as $cart) {
                SaleDetail::create([
                    "sale_id" => $sale->id,
                    "product_id" => $cart->product_id,
                    "type_discount" => $cart->type_discount,
                    "discount" => $cart->discount,
                    "type_campaing" => $cart->type_campaing,
                    "code_cupon" => $cart->code_cupon,
                    "code_discount" => $cart->code_discount,
                    "product_variation_id" => $cart->product_variation_id,
                    "quantity" => $cart->quantity,
                    "price_unit" => $cart->price_unit,
                    "subtotal" => $cart->subtotal,
                    "total" => $cart->total,
                    "currency" => $cart->currency,
                ]);

                if ($cart->product_variation_id) {
                    $variation = ProductVariation::findOrFail($cart->product_variation_id);

                    if ($variation->variation_father) {
                        $variation->variation_father->update([
                            "stock" => $variation->variation_father->stock - $cart->quantity
                        ]);
                    }

                    $variation->update([
                        "stock" => $variation->stock - $cart->quantity
                    ]);
                } else {
                    $product = Product::findOrFail($cart->product_id);
                    $product->update([
                        "stock" => $product->stock - $cart->quantity
                    ]);
                }

                $cart->delete();
            }

            $sale_addres = $request->sale_address;
            $sale_addres["sale_id"] = $sale->id;
            SaleAddres::create($sale_addres);

            return $sale;
        });

        $sale_new = Sale::findOrFail($sale->id);

        try {
            Mail::to($user->email)->send(new SaleMail($user, $sale_new));
        } catch (\Throwable $exception) {
            Log::warning("No se pudo enviar el correo de la venta {$sale->id}: " . $exception->getMessage());
        }

        return response()->json([
            "message" => 200,
            "sale_id" => $sale->id,
            "n_transaccion" => $sale->n_transaccion,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $sale = Sale::where("n_transaccion", $id)->first();

        return response()->json([
            "sale" => SaleResource::make($sale),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
