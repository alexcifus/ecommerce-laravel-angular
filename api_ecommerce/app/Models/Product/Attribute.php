<?php

namespace App\Models\Product;

use Carbon\Carbon;
use App\Models\Product\Propertie;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Attribute extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'name',
        'type_attribute',
        'state', 
    ];

    public function setCreateAtAttribute($value){
        date_default_timezone_set('Europe/Madrid');
        $this->attributes['created_at'] = Carbon::now();
    }
    public function setUpdatedAttribute($value){
        date_default_timezone_set('Europe/Madrid');
        $this->attributes['updated_at'] = Carbon::now();
    }

    public function properties(){
        return $this->hasMany(Propertie::class,);
    }

}
