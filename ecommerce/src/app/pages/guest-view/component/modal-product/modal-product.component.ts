import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

declare function MODAL_PRODUCT_DETAIL([]):any;
declare var $:any;
@Component({
  selector: 'app-modal-product',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './modal-product.component.html',
  styleUrl: './modal-product.component.css'
})
export class ModalProductComponent {

  @Input() product_selected:any;
  variation_selected:any;

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    setTimeout(() => {
      MODAL_PRODUCT_DETAIL($);
    }, 50);
  }

  getNewTotal(PRODUCT:any,DISCOUNT_FLASH_P:any){
    if(DISCOUNT_FLASH_P.type_discount == 1){//% DE DESCUENT0 50
      // 100 / 100*(50*0.01) 100*0.5=50
      return (PRODUCT.price_pen - PRODUCT.price_pen*(DISCOUNT_FLASH_P.discount*0.01)).toFixed(2)
    }else{//-PEN/-USD 
      return (PRODUCT.price_pen - DISCOUNT_FLASH_P.discount).toFixed(2);
    }
  }

  getTotalPriceProduct(PRODUCT:any){
    if(PRODUCT.discount_g){
      return this.getNewTotal(PRODUCT,PRODUCT.discount_g);
    }
    return PRODUCT.price_pen;
  }
  
  selectedVariation(variation:any){
    this.variation_selected = null;
    setTimeout(() => {
      this.variation_selected = variation;
      MODAL_PRODUCT_DETAIL($);
    }, 50);
  }
}
