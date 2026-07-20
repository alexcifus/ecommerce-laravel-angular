<table>
    @php
        $paymentMethods = [
            'PAYPAL' => 'PayPal',
            'CARD' => 'Tarjeta',
            'STORE' => 'Pago en tienda',
        ];
        $paymentStatuses = [
            'paid' => 'Pagado',
            'pending_payment' => 'Pendiente de pago',
        ];
    @endphp
    <tr>
        <td>VENTAS REALIZADAS</td>
    </tr>

    <thead>
        <tr>
            <th>#</th>
            <th width="35" style="background: #ff7272">Cliente</th>
            <th width="35" style="background: #ff7272">Metodo de pago</th>
            <th width="35" style="background: #ff7272">Estado del pago</th>
            <th width="35" style="background: #ff7272">Tipo de Moneda Total</th>
            <th width="35" style="background: #ff7272">Total</th>
            <th width="35" style="background: #ff7272">N° de Transaccion</th>
            <th width="35" style="background: #ff7272">Fecha de registro</th>
            <th width="35" style="background: #ff7272"> Region/Ciudad/Pais</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($sales as $key => $sale)
            <tr>
                <td>{{ $key+1 }}</td>
                <td>{{ $sale->user->name.' '.$sale->user->surnmae }}</td>
                <td>{{ $paymentMethods[$sale->method_payment] ?? $sale->method_payment }}</td>
                <td>{{ $paymentStatuses[$sale->status] ?? $sale->status }}</td>
                <td>{{ $sale->currency_total }}</td>
                <td>{{ $sale->total }} {{ $sale->currency_payment }}</td>
                <td>{{ $sale->n_transaccion ?: 'No disponible' }}</td>
                <td>{{ $sale->created_at->format("Y-m-d h:i:s") }}</td>
                <td>{{ $sale->sale_addres->country_region." ".
                        $sale->sale_addres->city." ".
                        $sale->sale_addres->company 
                }}</td>
            </tr>
        @endforeach
    </tbody>
</table>
