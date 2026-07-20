import { Component, ElementRef, ViewChild, afterNextRender } from '@angular/core';
import { CartService } from '../../home/service/cart.service';
import { CookieService } from 'ngx-cookie-service';
import { UserAddressService } from '../service/user-address.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

declare var paypal:any;
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule,RouterModule,CommonModule,],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {

  listCarts:any = [];
  totalCarts:number = 0;

  currency:string = 'EUR';

  address_list:any = [];

  name:string = '';
  surname:string = '';
  company:string = '';
  country_region:string = '';
  city:string = '';
  address:string = '';
  street:string = '';
  postcode_zip:string = '';
  phone:string = '';
  email:string = '';

  address_selected:any;
  description:string = '';
  selectedPaymentMethod:string = 'PAYPAL';
  isPlacingOrder:boolean = false;
  @ViewChild('paypal',{static: true}) paypalElement?: ElementRef;
  private readonly usdToEurRate:number = 0.8806798;
  private paypalOrderTotalEur:string = '';
  constructor(
    public cartService: CartService,
    public cookieService: CookieService, 
    public addressService: UserAddressService,
    private toastr: ToastrService,
    public router: Router,
  ) {

    afterNextRender(() => {
      this.addressService.listAddress().subscribe((resp:any) => {
        console.log(resp);
        this.address_list = resp.address;
      })
    })

  }
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'EUR';
    this.cartService.currentDataCart$.subscribe((resp:any) => {
      this.listCarts = resp;
      this.totalCarts = this.listCarts.reduce((sum:number, item:any) => sum + item.total, 0);
    })

    paypal.Buttons({
      // optional styling for buttons
      // https://developer.paypal.com/docs/checkout/standard/customize/buttons-style-guide/
      style: {
        color: "gold",
        shape: "rect",
        layout: "vertical"
      },

      // set up the transaction
      createOrder: (data:any, actions:any) => {
          // pass in any options from the v2 orders create call:
          // https://developer.paypal.com/api/orders/v2/#orders-create-request-body
        this.paypalOrderTotalEur = '';
        if(this.totalCarts == 0){
          this.toastr.error("Validación","No puedes procesar el pago con un monto de 0")
          return;
        }
        if(this.listCarts.length == 0){
          this.toastr.error("Validación","No puedes procesar el pago con un carrito de compra vacio")
          return;
        }
        if(!this.name ||
          !this.surname ||
          !this.country_region ||
          !this.city ||
          !this.address ||
          !this.street ||
          !this.postcode_zip ||
          !this.phone ||
          !this.email){
          this.toastr.error("Validacion","Todos los campos de la dirección son necesarios");
          return;
        }
          const paypalTotalEur = this.getPaypalTotalEur();
          if(!paypalTotalEur){
            return;
          }
          this.paypalOrderTotalEur = paypalTotalEur;
          const createOrderPayload = {
            purchase_units: [
              {
                amount: {
                    currency_code: 'EUR',
                    value: paypalTotalEur,
                }
              }
            ]
          };

          return actions.order.create(createOrderPayload);
      },

      // finalize the transaction
      onApprove: async (data:any, actions:any) => {
          
          let Order:any;
          try {
            Order = await actions.order.capture();
          } catch (error) {
            console.error('PayPal capture failed', error);
            this.toastr.error("PayPal", "No se pudo confirmar el pago con PayPal. Intentalo de nuevo.");
            return;
          }

          const capture = Order?.purchase_units?.[0]?.payments?.captures?.[0];
          const captureStatus = capture?.status;

          if(Order?.status !== 'COMPLETED' || !capture?.id || (captureStatus && captureStatus !== 'COMPLETED')){
            console.error('Invalid PayPal capture response', Order);
            this.toastr.error("PayPal", "PayPal no confirmo el pago correctamente. No se ha creado el pedido.");
            return;
          }

          const paypalTotalEur = this.paypalOrderTotalEur;
          if(!paypalTotalEur){
            this.toastr.error("PayPal","No se pudo recuperar el importe confirmado por PayPal.");
            return;
          }
          const paypalTotalEurNumber = Number(paypalTotalEur);

          let dataSale = {
            method_payment: 'PAYPAL',
            status: 'paid',
            payment_status: 'paid',
            paypal_order_id: data.orderID,
            currency_total: this.currency,
            currency_payment: 'EUR',
            discount: 0,
            subtotal: paypalTotalEurNumber,
            total: paypalTotalEurNumber,
            price_dolar: this.currency == 'USD' ? this.usdToEurRate : 1,
            n_transaccion: capture.id,
            description: this.description,
            sale_address: {
              name: this.name,
              surname: this.surname,
              company: this.company,
              country_region: this.country_region,
              city: this.city,
              address: this.address,
              street: this.street,
              postcode_zip: this.postcode_zip,
              phone: this.phone,
              email: this.email,
            }
          }
          if(this.isPlacingOrder){
            return;
          }

          this.isPlacingOrder = true;
          this.cartService.checkout(dataSale).subscribe((resp:any) => {
            console.log(resp);
            this.cartService.resetCart();
            this.toastr.success("Exito","La compra se a realizado");
            this.router.navigateByUrl("/gracias-por-tu-compra/"+(resp.sale_id || capture.id));
            // La redirección a la pagina de gracias
          },(error:any) => {
            console.error('Checkout failed after PayPal capture', error);
            this.toastr.error(
              "Pedido no guardado",
              "PayPal pudo haber confirmado el pago, pero no se pudo guardar el pedido. Contacta con soporte indicando la transaccion " + capture.id
            );
          }).add(() => {
            this.isPlacingOrder = false;
          });
          // return actions.order.capture().then(captureOrderHandler);
      },

      // handle unrecoverable errors
      onError: (err:any) => {
          console.error('An error prevented the buyer from checking out with PayPal');
          this.toastr.error("PayPal", "Ocurrio un error durante el pago con PayPal. Intentalo de nuevo.");
      }
  }).render(this.paypalElement?.nativeElement);
  }

  getPaypalTotalEur(): string {
    if(this.currency == 'EUR'){
      return Number(this.totalCarts).toFixed(2);
    }
    if(this.currency == 'USD'){
      return (Number(this.totalCarts) * this.usdToEurRate).toFixed(2);
    }
    this.toastr.error("PayPal","No se puede procesar PayPal con la moneda seleccionada.");
    return '';
  }

  confirmNonPaypalOrder(event?: Event){
    event?.preventDefault();

    if(!this.selectedPaymentMethod){
      this.toastr.error("Validacion","Selecciona un metodo de pago");
      return;
    }

    if(this.selectedPaymentMethod === 'PAYPAL'){
      this.toastr.error("Validacion","Usa el boton de PayPal para completar el pago");
      return;
    }

    const status = this.selectedPaymentMethod === 'CARD' ? 'paid' : 'pending_payment';
    this.placeOrder(this.selectedPaymentMethod, status);
  }

  placeOrder(method_payment:string, status:string){
    if(!this.validateCheckout()){
      return;
    }

    if(this.isPlacingOrder){
      return;
    }

    let dataSale = {
      method_payment: method_payment,
      status: status,
      currency_total: this.currency,
      currency_payment: this.currency,
      discount: 0,
      subtotal: this.totalCarts,
      total: this.totalCarts,
      price_dolar: 1,
      n_transaccion: null,
      description: this.description,
      sale_address: this.getSaleAddress(),
    }

    this.isPlacingOrder = true;
    this.cartService.checkout(dataSale).subscribe((resp:any) => {
      console.log(resp);
      this.cartService.resetCart();
      this.toastr.success("Exito","La compra se a realizado");
      this.router.navigateByUrl("/gracias-por-tu-compra/"+resp.sale_id);
    },(error:any) => {
      console.error('Checkout failed', error);
      this.toastr.error("Pedido no guardado","No se pudo confirmar el pedido. Intentalo de nuevo.");
    }).add(() => {
      this.isPlacingOrder = false;
    });
  }

  validateCheckout(){
    if(this.totalCarts == 0){
      this.toastr.error("Validacion","No puedes procesar el pedido con un monto de 0");
      return false;
    }
    if(this.listCarts.length == 0){
      this.toastr.error("Validacion","No puedes procesar el pedido con un carrito de compra vacio");
      return false;
    }
    if(!this.selectedPaymentMethod){
      this.toastr.error("Validacion","Selecciona un metodo de pago");
      return false;
    }
    if(!this.name ||
      !this.surname ||
      !this.country_region ||
      !this.city ||
      !this.address ||
      !this.street ||
      !this.postcode_zip ||
      !this.phone ||
      !this.email){
      this.toastr.error("Validacion","Todos los campos de la direccion son necesarios");
      return false;
    }
    return true;
  }

  getSaleAddress(){
    return {
      name: this.name,
      surname: this.surname,
      company: this.company,
      country_region: this.country_region,
      city: this.city,
      address: this.address,
      street: this.street,
      postcode_zip: this.postcode_zip,
      phone: this.phone,
      email: this.email,
    };
  }

  registerAddress(){

    if(!this.name ||
      !this.surname ||
      !this.country_region ||
      !this.city ||
      !this.address ||
      !this.street ||
      !this.postcode_zip ||
      !this.phone ||
      !this.email){
      this.toastr.error("Validacion","Todos los campos son necesarios");
      return;
    }

    let data = {
      name: this.name,
      surname: this.surname,
      company: this.company,
      country_region: this.country_region,
      city: this.city,
      address: this.address,
      street: this.street,
      postcode_zip: this.postcode_zip,
      phone: this.phone,
      email: this.email,
    };
    this.addressService.registerAddress(data).subscribe((resp:any) => {
      console.log(resp);
      this.toastr.success("Exitoso","La dirección se acaba de registrar");
      this.address_list.unshift(resp.addres);
    })
  }
  editAddress(){
    if(!this.name ||
      !this.surname ||
      !this.country_region ||
      !this.city ||
      !this.address ||
      !this.street ||
      !this.postcode_zip ||
      !this.phone ||
      !this.email){
      this.toastr.error("Validacion","Todos los campos son necesarios");
      return;
    }

    let data = {
      name: this.name,
      surname: this.surname,
      company: this.company,
      country_region: this.country_region,
      city: this.city,
      address: this.address,
      street: this.street,
      postcode_zip: this.postcode_zip,
      phone: this.phone,
      email: this.email,
    };
    this.addressService.updateAddress(this.address_selected.id,data).subscribe((resp:any) => {
      console.log(resp);
      this.toastr.success("Exitoso","La dirección se acaba de editar");
      let INDEX = this.address_list.findIndex((item:any) => item.id == resp.addres.id);
      if(INDEX != -1){
        this.address_list[INDEX] = resp.addres;
      }
    })
  }

  selectedAddress(addres:any){
    this.address_selected = addres;
    this.name = this.address_selected.name;
    this.surname = this.address_selected.surname;
    this.company = this.address_selected.company;
    this.country_region = this.address_selected.country_region;
    this.city = this.address_selected.city;
    this.address = this.address_selected.address;
    this.street = this.address_selected.street;
    this.postcode_zip = this.address_selected.postcode_zip;
    this.phone = this.address_selected.phone;
    this.email = this.address_selected.email;
  }

  resertAddress(){
    this.address_selected = null;
    this.name =  '';
    this.surname = '';
    this.company =  '';
    this.country_region =  '';
    this.city =  '';
    this.address =  '';
    this.street =  '';
    this.postcode_zip =  '';
    this.phone =  '';
    this.email =  '';
  }
}
