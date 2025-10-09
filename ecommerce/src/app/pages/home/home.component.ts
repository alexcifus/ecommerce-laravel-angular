import { Component, afterNextRender, afterRender } from '@angular/core';
import { HomeService } from './service/home.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ModalProductComponent } from '../guest-view/component/modal-product/modal-product.component';
import { CookieService } from 'ngx-cookie-service';

declare function SLIDER_PRINCIPAL([]):any;
declare var $:any;
declare function DATA_VALUES([]):any;
declare function PRODUCTS_CAROUSEL_HOME([]):any;
declare function MODAL_PRODUCT_DETAIL([]):any;
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule,RouterModule,CommonModule,ModalProductComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  
  SLIDERS:any = [];
  CATEGORIES_RANDOMS:any = [];
  
  TRADING_PRODUCT_NEW:any = [];
  TRADING_PRODUCT_FEATURE:any = [];
  TRADING_PRODUCT_TOP_SELLER:any = [];
  PRODUCTS_ELECTRONICS:any = [];
  PRODUCTS_CAROUSEL:any = [];

  BANNERS_SECUNDARIOS:any = [];
  BANNERS_PRODUCTS:any = [];

  LASTS_PRODUCT_DISCOUNT:any = [];
  LASTS_PRODUCT_FEATURE:any = [];
  LASTS_PRODUCT_SELLING:any = [];

  DISCOUNT_FLASH:any;
  DISCOUNT_FLASH_PRODUCTS:any = [];

  product_selected:any = null;
  variation_selected:any = null;
  currency:string = 'EUR';
  constructor(
    public homeService: HomeService,
    private cookieService: CookieService,
  ) {
    // afterNextRender(() => {
      this.homeService.home().subscribe((resp:any) => {
        // console.log(resp);
        this.SLIDERS = resp.sliders_principal;
        this.CATEGORIES_RANDOMS = resp.categories_randoms;
        this.TRADING_PRODUCT_NEW = resp.product_tranding_new.data;
        this.TRADING_PRODUCT_FEATURE = resp.product_tranding_featured.data;
        this.TRADING_PRODUCT_TOP_SELLER = resp.product_tranding_top_sellers.data;
        this.BANNERS_SECUNDARIOS = resp.sliders_secundario;
        this.PRODUCTS_ELECTRONICS = resp.product_electronics.data;
        this.PRODUCTS_CAROUSEL = resp.products_carusel.data;
        this.BANNERS_PRODUCTS = resp.sliders_products;

        this.LASTS_PRODUCT_DISCOUNT = resp.product_last_discounts.data;
        this.LASTS_PRODUCT_FEATURE = resp.product_last_featured.data;
        this.LASTS_PRODUCT_SELLING = resp.product_last_selling.data;

        this.DISCOUNT_FLASH = resp.discount_flash;
        this.DISCOUNT_FLASH_PRODUCTS = resp.discount_flash_products;

       
      })
    // })
    afterRender(() => {
      setTimeout(() => {
        SLIDER_PRINCIPAL($);
        DATA_VALUES($);
        PRODUCTS_CAROUSEL_HOME($);
        this.SLIDERS.forEach((SLIDER:any) => {
          this.getLabelSlider(SLIDER)
          this.getSubtitleSlider(SLIDER)
        });
        this.BANNERS_SECUNDARIOS.forEach((BANNER:any,index:number) => {
          if(index == 0){
            this.getTitleBannerSecundario(BANNER,'title-banner-s-'+BANNER.id);
          }else{
            this.getTitleBannerSecundario(BANNER,'title-banner-sa-'+BANNER.id);
          }
        });
      }, 50);
      this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'EUR';
    })

  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
  }

  getLabelSlider(SLIDER:any){
    var miDiv:any = document.getElementById('label-'+SLIDER.id);
    miDiv.innerHTML = SLIDER.label; 
    return '';
  }

  getSubtitleSlider(SLIDER:any){
    var miDiv:any = document.getElementById('subtitle-'+SLIDER.id);
    miDiv.innerHTML = SLIDER.subtitle; 
    return '';
  }

  getTitleBannerSecundario(BANNER:any,ID_BANNER:string){
    var miDiv:any = document.getElementById(ID_BANNER);
    miDiv.innerHTML = BANNER.title; 
    return '';
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

  openDetailProduct(PRODUCT:any){
    this.product_selected = null;
    this.variation_selected = null;
    setTimeout(() => {
      this.product_selected = PRODUCT;
      MODAL_PRODUCT_DETAIL($);
    }, 50);
  }

  selectedVariation(variation:any){
    this.variation_selected = null;
    setTimeout(() => {
      this.variation_selected = variation;
      MODAL_PRODUCT_DETAIL($);
    }, 50);
  }
}
