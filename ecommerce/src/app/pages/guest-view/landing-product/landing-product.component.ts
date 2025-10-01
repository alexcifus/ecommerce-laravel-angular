import { Component, afterNextRender, afterRender } from '@angular/core';
import { HomeService } from '../../home/service/home.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalProductComponent } from '../component/modal-product/modal-product.component';
import { CookieService } from 'ngx-cookie-service';

declare function MODAL_PRODUCT_DETAIL([]):any;
declare function LANDING_PRODUCT([]):any;
declare var $:any;
@Component({
  selector: 'app-landing-product',
  standalone: true,
  imports: [CommonModule,FormsModule,ModalProductComponent],
  templateUrl: './landing-product.component.html',
  styleUrl: './landing-product.component.css'
})
export class LandingProductComponent {

  PRODUCT_SLUG:any;
  PRODUCT_SELECTED:any;
  variation_selected:any;
  PRODUCT_RELATEDS:any = [];
  product_selected_modal:any;
  CAMPAING_CODE:any;
  DISCOUNT_CAMPAING:any;

  currency:string = 'PEN';
  constructor(
    public homeService: HomeService,
    public activedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private router:Router,
    private cookieService: CookieService,
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
        this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'PEN';
      })
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    
  }

  getNewTotal(PRODUCT:any,DISCOUNT_FLASH_P:any){
    if(this.currency == 'PEN'){
      if(DISCOUNT_FLASH_P.type_discount == 1){//% DE DESCUENT0 50
        // 100 / 100*(50*0.01) 100*0.5=50
        return (PRODUCT.price_pen - PRODUCT.price_pen*(DISCOUNT_FLASH_P.discount*0.01)).toFixed(2)
      }else{//-PEN/-USD 
        return (PRODUCT.price_pen - DISCOUNT_FLASH_P.discount).toFixed(2);
      }
    }else{
      if(DISCOUNT_FLASH_P.type_discount == 1){//% DE DESCUENT0 50
        // 100 / 100*(50*0.01) 100*0.5=50
        return (PRODUCT.price_usd - PRODUCT.price_usd*(DISCOUNT_FLASH_P.discount*0.01)).toFixed(2)
      }else{//-PEN/-USD 
        return (PRODUCT.price_usd - DISCOUNT_FLASH_P.discount).toFixed(2);
      }
    }

  }

  getTotalPriceProduct(PRODUCT:any){
    if(PRODUCT.discount_g){
      return this.getNewTotal(PRODUCT,PRODUCT.discount_g);
    }
    if(this.currency == 'PEN'){
      return PRODUCT.price_pen;
    }else{
      return PRODUCT.price_usd;
    }
  }

  getTotalCurrency(PRODUCT:any){
    if(this.currency == 'PEN'){
      return PRODUCT.price_pen;
    }else{
      return PRODUCT.price_usd;
    }
  }
  
  selectedVariation(variation:any){
    this.variation_selected = null;
    setTimeout(() => {
      this.variation_selected = variation;
      MODAL_PRODUCT_DETAIL($);
    }, 50);
  }

  openDetailModal(PRODUCT:any){
    this.product_selected_modal = null;
    setTimeout(() => {
      this.product_selected_modal = PRODUCT;
    }, 50);
  }
}
