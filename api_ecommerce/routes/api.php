<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');
Route::group([
    //'middleware' => 'api',
    'prefix' => 'auth'
], function ($router) {
    Route::post('/register', [AuthController::class, 'register'])->name('register');
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/login_ecommerce', [AuthController::class, 'login_ecommerce'])->name('login_ecommerce');
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:api')->name('logout');
    Route::post('/refresh', [AuthController::class, 'refresh'])->middleware('auth:api')->name('refresh');
    Route::post('/me', [AuthController::class, 'me'])->middleware('auth:api')->name('me');
    Route::post('/verified_auth', [AuthController::class, 'verified_auth'])->name('verified_auth');
    //
    Route::post('/verified_email', [AuthController::class, 'verified_email'])->name('verified_email');
    Route::post('/verified_code', [AuthController::class, 'verified_code'])->name('verified_code');
    Route::post('/new_password', [AuthController::class, 'new_password'])->name('new_password');
});

Route::group([

    'middleware' => 'auth:api',
    "prefix" => "admin",    
], function ($router) {
    Route::get("categories/config", [CategoryController::class,"config"]);
    Route::resource("categories", CategoryController::class);
    Route::post("categories/{id}", [CategoryController::class, "update"]);
});