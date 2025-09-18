<?php

namespace App\Models\Product;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Propertie extends Model
{
      
    use SoftDeletes;
    protected $fillable = [
        'attribute_id',
        'name',
        'code',
    ];

    public function setCreateAtAttribute($value){
        date_default_timezone_set('Europe/Madrid');
        $this->attributes['created_at'] = Carbon::now();
    }
    public function setUpdatedAttribute($value){
        date_default_timezone_set('Europe/Madrid');
        $this->attributes['updated_at'] = Carbon::now();
    }

    public function specifications(){
        return $this->hasMany(ProductSpecification::class);
    }
    public function variations(){
        return $this->hasMany(ProductVariation::class);
    }
}
