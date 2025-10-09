import { Component, afterNextRender, afterRender } from '@angular/core';
import { HomeService } from '../../home/service/home.service';
import { ActivatedRoute, Route, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalProductComponent } from '../component/modal-product/modal-product.component';
import { CookieService } from 'ngx-cookie-service';
import { CartService } from '../../home/service/cart.service';

declare function MODAL_PRODUCT_DETAIL([]):any;
declare function LANDING_PRODUCT([]):any;
declare function MODAL_QUANTITY_LANDING([]):any;
declare var $:any;
@Component({
  selector: 'app-landing-product',
  standalone: true,
  imports: [CommonModule,FormsModule,ModalProductComponent,RouterModule],
  templateUrl: './landing-product.component.html',
  styleUrl: './landing-product.component.css'
})
export class LandingProductComponent {

  PRODUCT_SLUG:any;
  PRODUCT_SELECTED:any;
  variation_selected:any;
  sub_variation_selected:any;
  PRODUCT_RELATEDS:any = [];
  product_selected_modal:any;
  CAMPAING_CODE:any;
  DISCOUNT_CAMPAING:any;

  currency:string = 'EUR';
  constructor(
    public homeService: HomeService,
    public activedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private router:Router,
    private cookieService: CookieService,
    public cartService: CartService,
  ) {
      this.activedRoute.params.subscribe((resp:any) => {
        this.PRODUCT_SLUG = resp.slug;
      })
      this.activedRoute.queryParams.subscribe((resp:any) => {
        this.CAMPAING_CODE = resp.campaing_discount;
      })
      // afterNextRender(() => {
        this.homeService.showProduct(this.PRODUCT_SLUG,this.CAMPAING_CODE).subscribe((resp:any) => {
          console.log(resp);
          if(resp.message == 403){
            this.toastr.error("Validacion",resp.message_text);
            this.router.navigateByUrl("/");
          }else{
            this.PRODUCT_SELECTED = resp.product;
            this.PRODUCT_RELATEDS = resp.product_relateds.data;
            this.DISCOUNT_CAMPAING = resp.discount_campaing;
            if(this.DISCOUNT_CAMPAING){
              this.PRODUCT_SELECTED.discount_g = this.DISCOUNT_CAMPAING;
            } 
          }
        })
      // })
      afterRender(() => {
        setTimeout(() => {
          MODAL_PRODUCT_DETAIL($);
            LANDING_PRODUCT($);
        }, 50);
        this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'EUR';
      })
  }
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    setTimeout(() => {
      MODAL_QUANTITY_LANDING($);
    }, 50);
  }
  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    
  }

  getNewTotal(PRODUCT:any,DISCOUNT_FLASH_P:any){
    if(this.currency == 'EUR'){
      if(DISCOUNT_FLASH_P.type_discount == 1){//% DE DESCUENT0 50
        // 100 / 100*(50*0.01) 100*0.5=50
        return (PRODUCT.price_eur - PRODUCT.price_eur*(DISCOUNT_FLASH_P.discount*0.01)).toFixed(2)
      }else{//-EUR/-USD 
        return (PRODUCT.price_eur - DISCOUNT_FLASH_P.discount).toFixed(2);
      }
    }else{
      if(DISCOUNT_FLASH_P.type_discount == 1){//% DE DESCUENT0 50
        // 100 / 100*(50*0.01) 100*0.5=50
        return (PRODUCT.price_usd - PRODUCT.price_usd*(DISCOUNT_FLASH_P.discount*0.01)).toFixed(2)
      }else{//-EUR/-USD 
        return (PRODUCT.price_usd - DISCOUNT_FLASH_P.discount).toFixed(2);
      }
    }

  }

  getTotalPriceProduct(PRODUCT:any){
    if(PRODUCT.discount_g){
      return this.getNewTotal(PRODUCT,PRODUCT.discount_g);
    }
    if(this.currency == 'EUR'){
      return PRODUCT.price_eur;
    }else{
      return PRODUCT.price_usd;
    }
  }

  getTotalCurrency(PRODUCT:any){
    if(this.currency == 'EUR'){
      return PRODUCT.price_eur;
    }else{
      return PRODUCT.price_usd;
    }
  }
  
  selectedVariation(variation:any){
    this.variation_selected = null;
    this.sub_variation_selected = null;
    setTimeout(() => {
      this.variation_selected = variation;
      MODAL_PRODUCT_DETAIL($);
    }, 50);
  }
  selectedSubVariation(subvariation:any){
    this.sub_variation_selected = null;
    setTimeout(() => {
      this.sub_variation_selected = subvariation;
    }, 50);
  }
  openDetailModal(PRODUCT:any){
    this.product_selected_modal = null;
    setTimeout(() => {
      this.product_selected_modal = PRODUCT;
    }, 50);
  }

  addCart(){
    if(!this.cartService.authService.user){
      this.toastr.error("Validacion","Ingrese a la tienda");
      this.router.navigateByUrl("/login");
      return;
    }

    let product_variation_id = null;
    if(this.PRODUCT_SELECTED.variations.length > 0){
      if(!this.variation_selected){
        this.toastr.error("Validacion","Necesitas seleccionar una variación");
        return;
      }
      if(this.variation_selected && this.variation_selected.subvariations.length > 0){
        if(!this.sub_variation_selected){
          this.toastr.error("Validacion","Necesitas seleccionar una SUB variación");
          return;
        }
      }
    }

    if(this.PRODUCT_SELECTED.variations.length > 0 && this.variation_selected &&
      this.variation_selected.subvariations.length == 0){
      product_variation_id = this.variation_selected.id;
    }
    if(this.PRODUCT_SELECTED.variations.length > 0 && this.variation_selected &&
      this.variation_selected.subvariations.length > 0){
      product_variation_id = this.sub_variation_selected.id;
    }

    let discount_g = null;

    if(this.PRODUCT_SELECTED.discount_g){
      discount_g = this.PRODUCT_SELECTED.discount_g;
    }

    let data = {
      product_id: this.PRODUCT_SELECTED.id,
      type_discount: discount_g ? discount_g.type_discount : null,
      discount: discount_g ? discount_g.discount : null,
      type_campaing: discount_g ? discount_g.type_campaing : null,
      code_cupon: null,
      code_discount: discount_g ? discount_g.code : null,
      product_variation_id: product_variation_id,
      quantity: $("#tp-cart-input-val").val(),
      price_unit: this.currency == 'EUR' ? this.PRODUCT_SELECTED.price_eur : this.PRODUCT_SELECTED.price_usd,
      subtotal: this.getTotalPriceProduct(this.PRODUCT_SELECTED),
      total: this.getTotalPriceProduct(this.PRODUCT_SELECTED)*$("#tp-cart-input-val").val(),
      currency: this.currency,
    }

    this.cartService.registerCart(data).subscribe((resp:any) => {
      console.log(resp);
      if(resp.message == 403){
        this.toastr.error("Validacion",resp.message_text);
      }else{
        this.cartService.changeCart(resp.cart);
        this.toastr.success("Exitos","El producto se agrego al carrito de compra");
      }
    },err => {
      console.log(err);
    })
  }
}
