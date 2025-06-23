<?php

namespace App\Http\Resources\Product;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "id" => $this->resource->id,
            "title" => $this->resource->title,
            "slug" => $this->resource->slug,
            "sku" => $this->resource->sku,
            "price_eur" => $this->resource->price_eur,
            "price_usd" => $this->resource->price_usd,
            "resume" => $this->resource->resume,
            "image" => env("APP_URL")."storage/".$this->resource->image,
            "state" => $this->resource->state,
            "description" => $this->resource->description,
            "tags" => $this->resource->tags,
            "brand_id" => $this->resource->brand_id,
            "brand" => $this->resource->brand ? [
                "id" => $this->resource->brand->id,
                "name" => $this->resource->brand->name,
            ] : null,
            "categorie_first_id" => $this->resource->categorie_first_id,
            "categorie_first" => $this->resource->categorie_first ? [
                "id" => $this->resource->categorie_first->id,
                "name" => $this->resource->categorie_first->name,
            ] : null,
            "categorie_second_id" => $this->resource->categorie_second_id,
            "categorie_second_id" => $this->resource->categorie_second_id ? [
                "id" => $this->resource->categorie_second->id,
                "name" => $this->resource->categorie_second->name,
            ] : null,
            "categorie_third_id" => $this->resource->categorie_third_id,
            "categorie_third_id" => $this->resource->categorie_third_id ? [
                "id" => $this->resource->categorie_third->id,
                "name" => $this->resource->categorie_third->name,
            ] : null,
            "stock" => $this->resource->stock,
            "created_at" => $this->resource->created_at->format('Y-m-d h:i:s'),
        ];
    }
}
