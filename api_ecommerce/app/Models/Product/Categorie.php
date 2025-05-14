<?php

namespace App\Models\Product;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Categorie extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'name',
        'icon',
        'image',
        'categorie_second_id',
        'categorie_third_id',
        'position',
        'type_categorie',
    ];

    public function setCreateAtAttribute($value){
        date_default_timezone_set('Europe/Madrid');
        $this->attributes['created_at'] = Carbon::now();
    }
    public function setUpdatedAttribute($value){
        date_default_timezone_set('Europe/Madrid');
        $this->attributes['updated_at'] = Carbon::now();
    }

    public function categorie_second(){
        return $this->belongsTo(Categorie::class, 'categorie_second_id');
    }
    public function categorie_third(){
        return $this->belongsTo(Categorie::class, 'categorie_third_id');
    }
    
}
