<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class PayPalService
{
    private string $baseUrl;

    private string $clientId;

    private string $clientSecret;

    private int $timeout;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('services.paypal.base_url'), '/');
        $this->clientId = (string) config('services.paypal.client_id');
        $this->clientSecret = (string) config('services.paypal.client_secret');
        $this->timeout = (int) config('services.paypal.timeout', 15);
    }

    public function createOrder(
        string $amount,
        string $currency,
        string $requestId,
        int $saleId
    ): array {
        $response = $this->send(function (string $accessToken) use (
            $amount,
            $currency,
            $requestId,
            $saleId
        ) {
            return Http::withToken($accessToken)
                ->acceptJson()
                ->asJson()
                ->timeout($this->timeout)
                ->withHeaders([
                    'PayPal-Request-Id' => $requestId,
                    'Prefer' => 'return=representation',
                ])
                ->post($this->baseUrl.'/v2/checkout/orders', [
                    'intent' => 'CAPTURE',
                    'purchase_units' => [[
                        'reference_id' => 'SALE-'.$saleId,
                        'invoice_id' => 'MOBILE-PAYPAL-'.$saleId,
                        'custom_id' => (string) $saleId,
                        'amount' => [
                            'currency_code' => strtoupper($currency),
                            'value' => $amount,
                        ],
                    ]],
                ]);
        }, 'crear la orden');

        $order = $this->successfulJson($response, 'crear la orden');

        if (empty($order['id'])) {
            throw new RuntimeException('PayPal no devolvió el identificador de la orden.');
        }

        return $order;
    }

    public function captureOrder(string $paypalOrderId, string $requestId): array
    {
        $response = $this->send(function (string $accessToken) use ($paypalOrderId, $requestId) {
            return Http::withToken($accessToken)
                ->acceptJson()
                ->timeout($this->timeout)
                ->withHeaders([
                    'PayPal-Request-Id' => $requestId,
                    'Prefer' => 'return=representation',
                ])
                ->withBody('{}', 'application/json')
                ->send(
                    'POST',
                    $this->baseUrl.'/v2/checkout/orders/'.urlencode($paypalOrderId).'/capture'
                );
        }, 'capturar la orden');

        return $this->successfulJson($response, 'capturar la orden');
    }

    private function accessToken(): string
    {
        $this->ensureConfigured();

        $cacheKey = 'paypal_access_token_'.md5($this->clientId.'|'.$this->baseUrl);
        $cachedToken = Cache::get($cacheKey);

        if (is_string($cachedToken) && $cachedToken !== '') {
            return $cachedToken;
        }

        try {
            $response = Http::withBasicAuth($this->clientId, $this->clientSecret)
                ->acceptJson()
                ->asForm()
                ->timeout($this->timeout)
                ->post($this->baseUrl.'/v1/oauth2/token', [
                    'grant_type' => 'client_credentials',
                ]);
        } catch (ConnectionException $exception) {
            throw new RuntimeException(
                'No se pudo conectar con PayPal para obtener el token de acceso.',
                0,
                $exception
            );
        }

        $payload = $this->successfulJson($response, 'obtener el token de acceso');
        $accessToken = $payload['access_token'] ?? null;

        if (! is_string($accessToken) || $accessToken === '') {
            throw new RuntimeException('PayPal no devolvió un token de acceso válido.');
        }

        $expiresIn = max(60, ((int) ($payload['expires_in'] ?? 300)) - 60);
        Cache::put($cacheKey, $accessToken, now()->addSeconds($expiresIn));

        return $accessToken;
    }

    private function send(callable $request, string $operation): Response
    {
        try {
            return $request($this->accessToken());
        } catch (ConnectionException $exception) {
            throw new RuntimeException(
                "No se pudo conectar con PayPal para {$operation}.",
                0,
                $exception
            );
        }
    }

    private function successfulJson(Response $response, string $operation): array
    {
        if (! $response->successful()) {
            $debugId = $response->header('PayPal-Debug-Id');
            $message = $response->json('message') ?: 'Respuesta no válida de PayPal';
            $debugText = $debugId ? " PayPal-Debug-Id: {$debugId}." : '';

            Log::error('PayPal API request failed', [
                'operation' => $operation,
                'status' => $response->status(),
                'paypal_debug_id' => $debugId,
                'response_body' => $response->body(),
            ]);

            throw new RuntimeException(
                "No se pudo {$operation} ({$response->status()}): {$message}.{$debugText}"
            );
        }

        $payload = $response->json();

        if (! is_array($payload)) {
            throw new RuntimeException("PayPal devolvió una respuesta inválida al {$operation}.");
        }

        return $payload;
    }

    private function ensureConfigured(): void
    {
        if ($this->baseUrl === '' || $this->clientId === '' || $this->clientSecret === '') {
            throw new RuntimeException(
                'La configuración de PayPal está incompleta en el servidor.'
            );
        }
    }
}
