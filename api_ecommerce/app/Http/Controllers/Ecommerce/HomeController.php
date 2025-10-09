<?php

namespace App\Http\Controllers\Ecommerce;

use Carbon\Carbon;
use App\Models\Slider;
use Illuminate\Http\Request;
use App\Models\Product\Product;
use App\Models\Discount\Discount;
use App\Models\Product\Categorie;
use App\Http\Controllers\Controller;
use App\Http\Resources\Ecommerce\Product\ProductEcommerceResource;
use App\Http\Resources\Ecommerce\Product\ProductEcommerceCollection;

class HomeController extends Controller
{
    //

    public function home(Request $request) {
        $sliders_principal = Slider::where("state",1)->where("type_slider",1)->orderBy("id","desc")->get();
        
        // ->orderBy("id","desc")
        $categories_randoms = Categorie::withCount(["product_categorie_firsts"])
                            ->where("categorie_second_id",NULL)
                            ->where("categorie_third_id",NULL)
                            ->inRandomOrder()->limit(5)->get();
        

        $product_tranding_new = Product::where("state",2)->inRandomOrder()->limit(8)->get();
        $product_tranding_featured = Product::where("state",2)->inRandomOrder()->limit(8)->get();
        $product_tranding_top_sellers = Product::where("state",2)->inRandomOrder()->limit(8)->get();

        $sliders_secundario = Slider::where("state",1)->where("type_slider",2)->orderBy("id","asc")->get();

        $product_electronics = Product::where("state",2)->where("categorie_first_id",1)->inRandomOrder()->limit(6)->get();

        $products_carusel = Product::where("state",2)->whereIn("categorie_first_id",$categories_randoms->pluck("id"))->inRandomOrder()->get();
        $sliders_products = Slider::where("state",1)->where("type_slider",3)->orderBy("id","asc")->get();

        $product_last_discounts = Product::where("state",2)->inRandomOrder()->limit(3)->get();
        $product_last_featured = Product::where("state",2)->inRandomOrder()->limit(3)->get();
        $product_last_selling = Product::where("state",2)->inRandomOrder()->limit(3)->get();


        date_default_timezone_set("Europe/Madrid");
        $DISCOUNT_FLASH = Discount::where("type_campaing",2)->where("state",1)
                            ->where("start_date","<=",today())
                            ->where("end_date",">=",today())
                            ->first();

        $DISCOUNT_FLASH_PRODUCTS = collect([]);

        if($DISCOUNT_FLASH){
            foreach ($DISCOUNT_FLASH->products as $key => $aux_product) {
                $DISCOUNT_FLASH_PRODUCTS->push(ProductEcommerceResource::make($aux_product->product));
            }
            foreach ($DISCOUNT_FLASH->categories as $key => $aux_categorie) {
                $products_of_categories = Product::where("state",2)->where("categorie_first_id",$aux_categorie->categorie_id)->get();
                foreach ($products_of_categories as $key => $product) {
                    $DISCOUNT_FLASH_PRODUCTS->push(ProductEcommerceResource::make($product));
                }
            }
            foreach ($DISCOUNT_FLASH->brands as $key => $aux_brand) {
                $products_of_brands = Product::where("state",2)->where("brand_id",$aux_brand->brand_id)->get();
                foreach ($products_of_brands as $key => $product) {
                    $DISCOUNT_FLASH_PRODUCTS->push(ProductEcommerceResource::make($product));
                }
            }
            // Sep 30 2024 20:20:22
            $DISCOUNT_FLASH->end_date_format = Carbon::parse($DISCOUNT_FLASH->end_date)->addDays(1)->format('M d Y H:i:s');
        }

        return response()->json([
            "sliders_principal" => $sliders_principal->map(function($slider) {
                return [
                    "id" => $slider->id,
                    "title"  => $slider->title,
                    "subtitle"  => $slider->subtitle,
                    "label"  => $slider->label,
                    "imagen"  => $slider->imagen ? env("APP_URL")."storage/".$slider->imagen : NULL,
                    "link"  => $slider->link,
                    "state"  => $slider->state,
                    "color"  => $slider->color,
                    "type_slider"  => $slider->type_slider,
                    "price_original"  => $slider->price_original,
                    "price_campaing" => $slider->price_campaing,
                ];
            }),
            "categories_randoms" => $categories_randoms->map(function($categorie) {
                return [
                    "id" => $categorie->id,
                    "name" => $categorie->name,
                    "products_count" => $categorie->product_categorie_firsts_count,
                    "imagen" => env("APP_URL")."storage/".$categorie->imagen, 
                ];
            }),
            "product_tranding_new" => ProductEcommerceCollection::make($product_tranding_new),
            "product_tranding_featured" => ProductEcommerceCollection::make($product_tranding_featured),
            "product_tranding_top_sellers" => ProductEcommerceCollection::make($product_tranding_top_sellers),
            "sliders_secundario" => $sliders_secundario->map(function($slider) {
                return [
                    "id" => $slider->id,
                    "title"  => $slider->title,
                    "subtitle"  => $slider->subtitle,
                    "label"  => $slider->label,
                    "imagen"  => $slider->imagen ? env("APP_URL")."storage/".$slider->imagen : NULL,
                    "link"  => $slider->link,
                    "state"  => $slider->state,
                    "color"  => $slider->color,
                    "type_slider"  => $slider->type_slider,
                    "price_original"  => $slider->price_original,
                    "price_campaing" => $slider->price_campaing,
                ];
            }),
            "product_electronics" => ProductEcommerceCollection::make($product_electronics),
            "products_carusel" => ProductEcommerceCollection::make($products_carusel),
            "sliders_products" => $sliders_products->map(function($slider) {
                return [
                    "id" => $slider->id,
                    "title"  => $slider->title,
                    "subtitle"  => $slider->subtitle,
                    "label"  => $slider->label,
                    "imagen"  => $slider->imagen ? env("APP_URL")."storage/".$slider->imagen : NULL,
                    "link"  => $slider->link,
                    "state"  => $slider->state,
                    "color"  => $slider->color,
                    "type_slider"  => $slider->type_slider,
                    "price_original"  => $slider->price_original,
                    "price_campaing" => $slider->price_campaing,
                ];
            }),
            "product_last_discounts" => ProductEcommerceCollection::make($product_last_discounts),
            "product_last_featured" => ProductEcommerceCollection::make($product_last_featured),
            "product_last_selling" => ProductEcommerceCollection::make($product_last_selling),
            "discount_flash" => $DISCOUNT_FLASH,
            "discount_flash_products" =>$DISCOUNT_FLASH_PRODUCTS,
        ]);
    }

    public function menus(){
        $categories_menus = Categorie::where("categorie_second_id",NULL)
                            ->where("categorie_third_id",NULL)
                            ->orderBy("position","desc")
                            ->get();

        return response()->json([
            "categories_menus" => $categories_menus->map(function($departament) {
                return [
                    "id" => $departament->id,
                    "name" => $departament->name,
                    "icon" => $departament->icon,
                    "categories" => $departament->categorie_seconds->map(function($categorie) {
                        return [
                            "id" => $categorie->id,
                            "name" => $categorie->name,
                            "imagen" => $categorie->imagen ? env("APP_URL")."storage/".$categorie->imagen : NULL,
                            "subcategories" => $categorie->categorie_seconds->map(function($subcategorie) {
                                return  [
                                    "id" => $subcategorie->id,
                                    "name" => $subcategorie->name,
                                    "imagen" => $subcategorie->imagen ? env("APP_URL")."storage/".$subcategorie->imagen : NULL, 
                                ];
                            })
                        ];
                    })
                ];
            }),
        ]);
    }

    public function show_product(Request $request,$slug){
        $campaing_discount = $request->get("campaing_discount");
        $discount = null;
        if($campaing_discount){
            $discount = Discount::where("code",$campaing_discount)->first();
        }
        $product = Product::where("slug",$slug)->where("state",2)->first();

        if(!$product){
            return response()->json([
                "message" => 403,
                "message_text" => "EL PRODUCTO NO EXISTE" 
            ]);
        }

        $product_relateds = Product::where("categorie_first_id",$product->categorie_first_id)->where("state",2)->get();

        return response()->json([
            "message" => 200,
            "product" => ProductEcommerceResource::make($product),
            "product_relateds" => ProductEcommerceCollection::make($product_relateds),
            "discount_campaing" => $discount,
        ]);
    }
}
