import { Component, afterNextRender } from '@angular/core';
import { HomeService } from '../../home/service/home.service';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { ModalProductComponent } from '../component/modal-product/modal-product.component';
import { CartService } from '../../home/service/cart.service';
import { ToastrService } from 'ngx-toastr';
import { distinctUntilChanged, filter as rxFilter, map, merge } from 'rxjs';

declare var $:any;
@Component({
  selector: 'app-filter-advance',
  standalone: true,
  imports: [FormsModule,RouterModule,CommonModule,ModalProductComponent],
  templateUrl: './filter-advance.component.html',
  styleUrl: './filter-advance.component.css'
})
export class FilterAdvanceComponent {

  Categories:any = [];
  Colors:any = [];
  Brands:any = [];
  Products_relateds:any = [];

  PRODUCTS:any = [];
  productsPerPage:number = 12;
  currentPage:number = 1;
  currency:string = 'EUR';

  product_selected:any = null;
  variation_selected:any = null;

  categories_selected:any = [];
  colors_selected:any = [];
  brands_selected:any = [];
  min_price:number = 0;
  max_price:number = 0;
  options_aditional:any = [];
  search:string = '';
  category_id:number|null = null;
  private latestProductsRequest:number = 0;
  constructor(
    public homeService: HomeService,
    public cookieService: CookieService,
    public cartService: CartService,
    public toastr: ToastrService,
    public router: Router,
    public activedRoute: ActivatedRoute,
  ) {
    
    this.homeService.getConfigFilter().subscribe((resp:any) => {
      // console.log(resp);
      this.Categories = resp.categories;
      this.Colors = resp.colors;
      this.Brands = resp.brands;
      this.Products_relateds = resp.product_relateds.data;
    })

    afterNextRender(() => {
      $("#slider-range").slider({
        range: true,
        min: 0,
        max: 2000,
        values: [200, 500],
        slide: (event:any, ui:any) => {
          $("#amount").val(this.currency+ " " + ui.values[0] + " - "+this.currency+ " " + ui.values[1]);
          this.min_price = ui.values[0];
          this.max_price = ui.values[1];
        },stop: () => {
          this.filterAdvanceProduct();
        }
      });
      $("#amount").val(this.currency+ " " + $("#slider-range").slider("values", 0) +
        " - "+this.currency+ " " + $("#slider-range").slider("values", 1));
    })
  }

  ngOnInit(): void {
    this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'EUR';

    merge(
      this.activedRoute.queryParamMap,
      this.router.events.pipe(
        rxFilter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map(() => this.activedRoute.snapshot.queryParamMap)
      )
    ).pipe(
      map((params) => {
        const categoryId = this.parseCategoryId(params.get('category_id'));

        return {
          search: params.get('search') ?? '',
          categoryId,
        };
      }),
      distinctUntilChanged((previous, current) =>
        previous.search == current.search && previous.categoryId == current.categoryId
      )
    ).subscribe((params) => {
      this.search = params.search;
      this.category_id = params.categoryId;
      this.resetRouteFilters();
      this.currentPage = 1;
      this.filterAdvanceProduct();
    });
  }

  private parseCategoryId(categoryId:string|null):number|null {
    if(!categoryId){
      return null;
    }

    const parsedCategoryId = Number(categoryId);
    return Number.isFinite(parsedCategoryId) ? parsedCategoryId : null;
  }

  private resetRouteFilters(){
    this.categories_selected = [];
    this.colors_selected = [];
    this.brands_selected = [];
    this.options_aditional = [];
    this.min_price = 0;
    this.max_price = 0;
  }

  addCompareProduct(TRADING_PRODUCT:any){
    let COMPARES = localStorage.getItem("compares") ? JSON.parse(localStorage.getItem("compares") ?? '') : [];

    let INDEX = COMPARES.findIndex((item:any) => item.id == TRADING_PRODUCT.id);
    if(INDEX != -1){
      this.toastr.error("Validacion","El producto ya existe en la lista");
      return;
    }
    COMPARES.push(TRADING_PRODUCT);
    this.toastr.success("Exito","El producto se agrego a lista de comparacion");

    localStorage.setItem("compares",JSON.stringify(COMPARES));
    if(COMPARES.length > 1){
      this.router.navigateByUrl("/compare-product");
    }
  }
  
  reset(){
    window.location.href = "/productos-busqueda";
  }

  addOptionAditional(option:string){
    let INDEX = this.options_aditional.findIndex((item:any) => item == option);
    if(INDEX != -1){
      this.options_aditional.splice(INDEX,1);
    }else{
      this.options_aditional.push(option);
    }
    console.log(this.options_aditional);
    this.currentPage = 1;
    this.filterAdvanceProduct();
    
  }
  addCategorie(categorie:any){
    let INDEX = this.categories_selected.findIndex((item:any) => item == categorie.id);
    if(INDEX != -1){
      this.categories_selected.splice(INDEX,1);
    }else{
      this.categories_selected.push(categorie.id);
    }
    console.log(this.categories_selected);
    this.currentPage = 1;
    this.filterAdvanceProduct();
  }
  addBrand(Brand:any) {
    let INDEX = this.brands_selected.findIndex((item:any) => item == Brand.id);
    if(INDEX != -1){
      this.brands_selected.splice(INDEX,1);
    }else{
      this.brands_selected.push(Brand.id);
    }
    console.log(this.brands_selected);
    this.currentPage = 1;
    this.filterAdvanceProduct();
  }
  addColor(color:any){
    let INDEX = this.colors_selected.findIndex((item:any) => item == color.id);
    if(INDEX != -1){
      this.colors_selected.splice(INDEX,1);
    }else{
      this.colors_selected.push(color.id);
    }
    console.log(this.colors_selected);
    this.currentPage = 1;
    this.filterAdvanceProduct();
  }

  get productsTotal():number {
    return this.PRODUCTS.length;
  }

  get totalPages():number {
    return Math.ceil(this.productsTotal / this.productsPerPage);
  }

  get paginationPages():number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  get paginatedProducts():any[] {
    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    return this.PRODUCTS.slice(startIndex, startIndex + this.productsPerPage);
  }

  get firstProductShown():number {
    if(this.productsTotal == 0){
      return 0;
    }

    return (this.currentPage - 1) * this.productsPerPage + 1;
  }

  get lastProductShown():number {
    return Math.min(this.currentPage * this.productsPerPage, this.productsTotal);
  }

  changePage(page:number){
    if(page < 1 || page > this.totalPages || page == this.currentPage){
      return;
    }

    this.currentPage = page;
  }

  filterAdvanceProduct() {
    let data = {
      categories_selected: this.categories_selected,
      colors_selected: this.colors_selected,
      brands_selected: this.brands_selected,
      min_price: this.min_price,
      max_price: this.max_price,
      currency: this.currency,
      options_aditional: this.options_aditional,
      search: this.search,
      category_id: this.category_id,
    }
    const requestId = ++this.latestProductsRequest;

    this.homeService.filterAdvanceProduct(data).subscribe((resp:any) => {
      if(requestId != this.latestProductsRequest){
        return;
      }

      console.log(resp);
      this.PRODUCTS = resp.products.data;
      if(this.currentPage > this.totalPages){
        this.currentPage = this.totalPages || 1;
      }
    })
  }

  getTotalCurrency(PRODUCT:any){
    if(this.currency == 'EUR'){
      return PRODUCT.price_eur;
    }else{
      return PRODUCT.price_usd;
    }
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

  addCart(PRODUCT:any) {
    if(!this.cartService.authService.user){
      this.toastr.error("Validacion","Ingrese a la tienda");
      this.router.navigateByUrl("/login");
      return;
    }

    if(PRODUCT.variations.length > 0){
      $("#producQuickViewModal").modal("show");
      this.openDetailProduct(PRODUCT);
      return;
    }

    let discount_g = null;

    if(PRODUCT.discount_g){
      discount_g = PRODUCT.discount_g;
    }

    let data = {
      product_id: PRODUCT.id,
      type_discount: discount_g ? discount_g.type_discount : null,
      discount: discount_g ? discount_g.discount : null,
      type_campaing: discount_g ? discount_g.type_campaing : null,
      code_cupon: null,
      code_discount: discount_g ? discount_g.code : null,
      product_variation_id: null,
      quantity: 1,
      price_unit: this.currency == 'EUR' ? PRODUCT.price_eur : PRODUCT.price_usd,
      subtotal: this.getTotalPriceProduct(PRODUCT),
      total: this.getTotalPriceProduct(PRODUCT)*1,
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
  
  openDetailProduct(PRODUCT:any,DISCOUNT_FLASH:any = null){
    this.product_selected = null;
    this.variation_selected = null;
    setTimeout(() => {
      setTimeout(() => {
        if(DISCOUNT_FLASH){
          this.product_selected.discount_g = DISCOUNT_FLASH;
        }
      }, 25);
      this.product_selected = PRODUCT;
      // MODAL_PRODUCT_DETAIL($);
    }, 50);
  }
}
