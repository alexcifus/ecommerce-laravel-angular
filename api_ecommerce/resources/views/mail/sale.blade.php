<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Confirmacion de pedido</title>
</head>
<body style="margin:0; padding:0; background:#f4f5f7; font-family:Arial, sans-serif; color:#282828;">
    @php
        $isPaid = ($sale->status ?? null) === 'paid';
        $paymentStatusLabel = $isPaid ? 'Pagado' : 'Pago pendiente';
        $headerTitle = $isPaid ? 'Pedido confirmado' : 'Pedido recibido';
        $headerText = $isPaid
            ? 'El pago se ha realizado correctamente.'
            : 'Hemos recibido tu pedido correctamente. El pago esta pendiente.';
    @endphp

    <table width="100%" cellspacing="0" cellpadding="0" style="background:#f4f5f7; padding:30px 0;">
        <tr>
            <td align="center">
                <table width="680" cellspacing="0" cellpadding="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
                    <tr>
                        <td style="padding:28px 32px; background:#0989ff; color:#ffffff;">
                            <h1 style="margin:0; font-size:24px; line-height:30px;">{{ $headerTitle }}</h1>
                            <p style="margin:8px 0 0; font-size:15px; line-height:22px;">{{ $headerText }}</p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:32px;">
                            <p style="margin:0 0 22px; font-size:16px; line-height:24px;">
                                Hola {{ trim(($user->name ?? '').' '.($user->surname ?? '')) ?: 'cliente' }},
                            </p>

                            <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; font-size:15px; margin-bottom:28px;">
                                <tr>
                                    <td style="padding:12px; border:1px solid #e5e7eb; font-weight:bold;">Pedido</td>
                                    <td style="padding:12px; border:1px solid #e5e7eb;">#{{ $sale->id }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:12px; border:1px solid #e5e7eb; font-weight:bold;">Numero de transaccion</td>
                                    <td style="padding:12px; border:1px solid #e5e7eb;">{{ $sale->n_transaccion }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:12px; border:1px solid #e5e7eb; font-weight:bold;">Cliente</td>
                                    <td style="padding:12px; border:1px solid #e5e7eb;">{{ trim(($user->name ?? '').' '.($user->surname ?? '')) }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:12px; border:1px solid #e5e7eb; font-weight:bold;">Metodo de pago</td>
                                    <td style="padding:12px; border:1px solid #e5e7eb;">{{ $sale->method_payment }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:12px; border:1px solid #e5e7eb; font-weight:bold;">Estado del pago</td>
                                    <td style="padding:12px; border:1px solid #e5e7eb;">{{ $paymentStatusLabel }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:12px; border:1px solid #e5e7eb; font-weight:bold;">Fecha del pedido</td>
                                    <td style="padding:12px; border:1px solid #e5e7eb;">{{ $sale->created_at->format('Y-m-d H:i') }}</td>
                                </tr>
                            </table>

                            @if($sale->sale_addres)
                                <h2 style="margin:0 0 12px; font-size:18px; line-height:24px;">Direccion de envio</h2>
                                <p style="margin:0 0 28px; font-size:15px; line-height:23px; color:#4b5563;">
                                    {{ $sale->sale_addres->name }} {{ $sale->sale_addres->surname }}<br>
                                    {{ $sale->sale_addres->address }}<br>
                                    {{ $sale->sale_addres->street }}<br>
                                    {{ $sale->sale_addres->city }}, {{ $sale->sale_addres->country_region }} {{ $sale->sale_addres->postcode_zip }}<br>
                                    {{ $sale->sale_addres->phone }}<br>
                                    {{ $sale->sale_addres->email }}
                                </p>
                            @endif

                            <h2 style="margin:0 0 12px; font-size:18px; line-height:24px;">Productos</h2>
                            <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; font-size:14px;">
                                <thead>
                                    <tr>
                                        <th align="left" style="padding:12px; border:1px solid #e5e7eb; background:#f9fafb;">Producto</th>
                                        <th align="center" style="padding:12px; border:1px solid #e5e7eb; background:#f9fafb;">Cantidad</th>
                                        <th align="right" style="padding:12px; border:1px solid #e5e7eb; background:#f9fafb;">Precio</th>
                                        <th align="right" style="padding:12px; border:1px solid #e5e7eb; background:#f9fafb;">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($sale->sale_details as $sale_detail)
                                        <tr>
                                            <td style="padding:12px; border:1px solid #e5e7eb;">
                                                <strong>{{ $sale_detail->product->title }}</strong>
                                                @if ($sale_detail->product_variation)
                                                    <br>
                                                    <span style="color:#6b7280;">
                                                        {{ $sale_detail->product_variation->attribute->name }}:
                                                        {{ $sale_detail->product_variation->propertie ? $sale_detail->product_variation->propertie->name : $sale_detail->product_variation->value_add }}
                                                        @if ($sale_detail->product_variation->variation_father)
                                                            <br>
                                                            {{ $sale_detail->product_variation->variation_father->attribute->name }}:
                                                            {{ $sale_detail->product_variation->variation_father->propertie ? $sale_detail->product_variation->variation_father->propertie->name : $sale_detail->product_variation->variation_father->value_add }}
                                                        @endif
                                                    </span>
                                                @endif
                                            </td>
                                            <td align="center" style="padding:12px; border:1px solid #e5e7eb;">{{ $sale_detail->quantity }}</td>
                                            <td align="right" style="padding:12px; border:1px solid #e5e7eb;">{{ $sale_detail->price_unit }} {{ $sale_detail->currency }}</td>
                                            <td align="right" style="padding:12px; border:1px solid #e5e7eb;">{{ $sale_detail->total }} {{ $sale_detail->currency }}</td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>

                            <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin-top:24px; font-size:16px;">
                                <tr>
                                    <td align="right" style="padding:8px 12px;">Subtotal:</td>
                                    <td align="right" width="160" style="padding:8px 12px;">{{ $sale->subtotal }} {{ $sale->currency_payment }}</td>
                                </tr>
                                <tr>
                                    <td align="right" style="padding:8px 12px;">Descuento:</td>
                                    <td align="right" width="160" style="padding:8px 12px;">{{ $sale->discount }} {{ $sale->currency_payment }}</td>
                                </tr>
                                <tr>
                                    <td align="right" style="padding:12px; font-weight:bold; font-size:18px;">Total:</td>
                                    <td align="right" width="160" style="padding:12px; font-weight:bold; font-size:18px;">{{ $sale->total }} {{ $sale->currency_payment }}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
