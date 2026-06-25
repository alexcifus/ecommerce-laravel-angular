<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sale\Sale;
use App\Models\Sale\SaleDetail;
use App\Models\Product\Product;
use Illuminate\Support\Facades\DB;

class MobileCheckoutController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            "items" => "required|array|min:1",
            "items.*.product_id" => "required|integer|exists:products,id",
            "items.*.quantity" => "required|integer|min:1",
            "items.*.price" => "required|numeric|min:0",
            "total" => "required|numeric|min:0",
        ]);

        $user = auth("api")->user();

        DB::beginTransaction();

        try {
            $sale = Sale::create([
                "user_id" => $user->id,
                "method_payment" => "mobile",
                "currency_total" => "EUR",
                "currency_payment" => "EUR",
                "discount" => 0,
                "subtotal" => $request->total,
                "total" => $request->total,
                "price_dolar" => 1,
                "description" => "Pedido realizado desde la app móvil",
                "n_transaccion" => "MOBILE-" . time(),
                "status" => "pending_payment",
            ]);

            foreach ($request->items as $item) {
                $subtotal = $item["price"] * $item["quantity"];

                SaleDetail::create([
                    "sale_id" => $sale->id,
                    "product_id" => $item["product_id"],
                    "quantity" => $item["quantity"],
                    "price_unit" => $item["price"],
                    "subtotal" => $subtotal,
                    "total" => $subtotal,
                    "currency" => "EUR",
                    "discount" => 0,
                ]);

                $product = Product::find($item["product_id"]);

                if ($product) {
                    $product->update([
                        "stock" => max(0, $product->stock - $item["quantity"])
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                "message" => 200,
                "message_text" => "Pedido realizado correctamente",
                "sale_id" => $sale->id,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                "message" => 500,
                "message_text" => "Error al crear el pedido",
                "error" => $e->getMessage(),
            ], 500);
        }
    }
}
