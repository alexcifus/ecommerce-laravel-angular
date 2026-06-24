<?php

namespace App\Http\Controllers\Admin\Sale;

use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Sale\Sale;
use App\Exports\SaleExport;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;

class SalesController extends Controller
{
    
    
    public function list(Request $request) {

        $search = $request->search;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $brand_id = $request->brand_id;

        $categorie_first_id = $request->categorie_first_id;
        $categorie_second_id = $request->categorie_second_id;
        $categorie_third_id = $request->categorie_third_id;

        $method_payment = $request->method_payment;

        $sales = Sale::with(["user", "sale_addres"])
                        ->filterAdvanceAdmin($search,$start_date,$end_date,$brand_id,$categorie_first_id,
                        $categorie_second_id,$categorie_third_id,$method_payment)
                        ->orderBy("id","desc")->paginate(25);

        return response()->json([
            "total" => $sales->total(),
            "sales" => [
                "data" => $sales->getCollection()->map(function ($sale) {
                    return [
                        "id" => $sale->id,
                        "user_id" => $sale->user_id,
                        "user" => $sale->user ? [
                            "avatar" => $sale->user->avatar ? env("APP_URL"). "storage/". $sale->user->avatar : 'https://cdn-icons-png.flaticon.com/512/1476/1476614.png',
                            "full_name" => trim($sale->user->name. ' '.$sale->user->surname),
                            "phone" => $sale->user->phone,
                            "email" => $sale->user->email,
                        ] : [
                            "avatar" => 'https://cdn-icons-png.flaticon.com/512/1476/1476614.png',
                            "full_name" => "Cliente no disponible",
                            "phone" => null,
                            "email" => null,
                        ],
                        "method_payment" => $sale->method_payment,
                        "currency_total" => $sale->currency_total,
                        "currency_payment" => $sale->currency_payment,
                        "discount" => $sale->discount,
                        "subtotal" => $sale->subtotal,
                        "total" => $sale->total,
                        "n_transaccion" => $sale->n_transaccion,
                        "sale_address" => $sale->sale_addres,
                        "created_at" => $sale->created_at->format("Y-m-d h:i A"),
                    ];
                }),
            ],
        ]);
    }

    public function list_excel(Request $request){

        $search = $request->search;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $brand_id = $request->brand_id;

        $categorie_first_id = $request->categorie_first_id;
        $categorie_second_id = $request->categorie_second_id;
        $categorie_third_id = $request->categorie_third_id;

        $method_payment = $request->method_payment;

        $sales = Sale::filterAdvanceAdmin($search,$start_date,$end_date,$brand_id,$categorie_first_id,
                        $categorie_second_id,$categorie_third_id,$method_payment)
                        ->orderBy("id","desc")->get();

        return Excel::download(new SaleExport($sales),"sales_export.xlsx");
    }

    public function report_pdf($id){
        $sale = Sale::findOrFail($id);

        $pdf = PDF::loadView("sale.sale_pdf",compact("sale"));

        return $pdf->stream("venta_pdf".$sale->id.".pdf");
    }
}
