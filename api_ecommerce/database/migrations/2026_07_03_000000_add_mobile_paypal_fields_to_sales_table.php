<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->uuid('payment_request_id')->nullable()->unique()->after('status');
            $table->string('paypal_order_id')->nullable()->unique()->after('payment_request_id');
            $table->string('paypal_capture_id')->nullable()->unique()->after('paypal_order_id');
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropUnique(['payment_request_id']);
            $table->dropUnique(['paypal_order_id']);
            $table->dropUnique(['paypal_capture_id']);
            $table->dropColumn([
                'payment_request_id',
                'paypal_order_id',
                'paypal_capture_id',
            ]);
        });
    }
};
