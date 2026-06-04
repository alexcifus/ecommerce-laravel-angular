<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class MobileAuthController extends Controller
{
    public function login(Request $request)
    {
        // 1) Validar datos que llegan de la app
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        // 2) Buscar usuario por email
        $user = User::where('email', $request->email)->first();

        // 3) Comprobar credenciales
        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Credenciales inválidas',
            ], 401);
        }

        // 4) Generar un "token" sencillo para pruebas de la app
        //    (para producción se usaría Sanctum o JWT)
        $fakeToken = base64_encode($user->id . '|' . now());

        // 5) Devolver JSON limpio para Android
        return response()->json([
            'token' => $fakeToken,
            'user'  => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ],
        ]);
    }
}
