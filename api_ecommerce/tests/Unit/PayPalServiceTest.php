<?php

namespace Tests\Unit;

use App\Services\PayPalService;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PayPalServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config([
            'cache.default' => 'array',
            'services.paypal.client_id' => 'sandbox-client-id',
            'services.paypal.client_secret' => 'sandbox-client-secret',
            'services.paypal.base_url' => 'https://api-m.sandbox.paypal.com',
            'services.paypal.timeout' => 15,
        ]);

        Cache::clear();
    }

    public function test_it_creates_a_paypal_order_with_server_amount_and_idempotency(): void
    {
        Http::fake([
            'https://api-m.sandbox.paypal.com/v1/oauth2/token' => Http::response([
                'access_token' => 'sandbox-access-token',
                'expires_in' => 3600,
            ]),
            'https://api-m.sandbox.paypal.com/v2/checkout/orders' => Http::response([
                'id' => 'PAYPAL-ORDER-123',
                'status' => 'CREATED',
            ], 201),
        ]);

        $order = app(PayPalService::class)->createOrder(
            '42.50',
            'EUR',
            'mobile-create-request-id',
            25
        );

        $this->assertSame('PAYPAL-ORDER-123', $order['id']);

        Http::assertSent(function (Request $request) {
            return $request->url() === 'https://api-m.sandbox.paypal.com/v2/checkout/orders'
                && $request->hasHeader('PayPal-Request-Id', 'mobile-create-request-id')
                && $request['intent'] === 'CAPTURE'
                && data_get($request->data(), 'purchase_units.0.amount.value') === '42.50'
                && data_get($request->data(), 'purchase_units.0.amount.currency_code') === 'EUR';
        });
    }

    public function test_it_captures_a_paypal_order_with_idempotency(): void
    {
        Http::fake([
            'https://api-m.sandbox.paypal.com/v1/oauth2/token' => Http::response([
                'access_token' => 'sandbox-access-token',
                'expires_in' => 3600,
            ]),
            'https://api-m.sandbox.paypal.com/v2/checkout/orders/PAYPAL-ORDER-123/capture' => Http::response([
                'id' => 'PAYPAL-ORDER-123',
                'status' => 'COMPLETED',
                'purchase_units' => [[
                    'payments' => [
                        'captures' => [[
                            'id' => 'PAYPAL-CAPTURE-123',
                            'status' => 'COMPLETED',
                            'amount' => [
                                'value' => '42.50',
                                'currency_code' => 'EUR',
                            ],
                        ]],
                    ],
                ]],
            ]),
        ]);

        $order = app(PayPalService::class)->captureOrder(
            'PAYPAL-ORDER-123',
            'mobile-capture-request-id'
        );

        $this->assertSame('COMPLETED', $order['status']);

        Http::assertSent(function (Request $request) {
            return $request->url()
                    === 'https://api-m.sandbox.paypal.com/v2/checkout/orders/PAYPAL-ORDER-123/capture'
                && $request->hasHeader('PayPal-Request-Id', 'mobile-capture-request-id');
        });
    }
}
