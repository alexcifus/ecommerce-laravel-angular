<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Estado del pedido actualizado</title>
</head>
<body style="margin:0; padding:0; background:#f4f5f7; font-family:Arial, sans-serif; color:#282828;">
    <table width="100%" cellspacing="0" cellpadding="0" style="background:#f4f5f7; padding:30px 0;">
        <tr>
            <td align="center">
                <table width="600" cellspacing="0" cellpadding="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
                    <tr>
                        <td style="padding:28px 32px; background:#0989ff; color:#ffffff;">
                            <h1 style="margin:0; font-size:24px; line-height:30px;">Estado del pedido actualizado</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px;">
                            <p style="margin:0 0 18px; font-size:16px; line-height:24px;">
                                Hola {{ trim(($sale->user->name ?? '').' '.($sale->user->surname ?? '')) ?: 'cliente' }},
                            </p>

                            <p style="margin:0 0 24px; font-size:16px; line-height:24px;">
                                El estado de tu pedido ha cambiado.
                            </p>

                            <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; font-size:15px;">
                                <tr>
                                    <td style="padding:12px; border:1px solid #e5e7eb; font-weight:bold;">Pedido</td>
                                    <td style="padding:12px; border:1px solid #e5e7eb;">#{{ $sale->id }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:12px; border:1px solid #e5e7eb; font-weight:bold;">Numero de transaccion</td>
                                    <td style="padding:12px; border:1px solid #e5e7eb;">{{ $sale->n_transaccion }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:12px; border:1px solid #e5e7eb; font-weight:bold;">Nuevo estado</td>
                                    <td style="padding:12px; border:1px solid #e5e7eb;">{{ $statusLabel }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:12px; border:1px solid #e5e7eb; font-weight:bold;">Total</td>
                                    <td style="padding:12px; border:1px solid #e5e7eb;">{{ $sale->total }} {{ $sale->currency_payment }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:12px; border:1px solid #e5e7eb; font-weight:bold;">Fecha del cambio</td>
                                    <td style="padding:12px; border:1px solid #e5e7eb;">{{ $changedAt->format('Y-m-d H:i') }}</td>
                                </tr>
                            </table>

                            <p style="margin:28px 0 0; font-size:14px; line-height:22px; color:#6e6e6e;">
                                Gracias por comprar en {{ config('app.name') }}.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
