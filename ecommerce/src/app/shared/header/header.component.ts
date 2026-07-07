import { Component, afterNextRender, afterRender, ChangeDetectorRef } from '@angular/core';
import { HomeService } from '../../pages/home/service/home.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { CartService } from '../../pages/home/service/cart.service';
import { ToastrService } from 'ngx-toastr';

declare function CurrecyChange([]):any;
declare var $:any;
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule,RouterModule,CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  categories_menus:any = [];
  currency:string = 'EUR';

  user:any;
  listCarts:any = [];
  totalCarts:number = 0;
  isLoading:boolean = false;
  searchT:string = '';
  selectedCategoryId:string = '';
  constructor(
    public homeService: HomeService,
    public cookieService: CookieService,
    public cartService: CartService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
  ) {
    afterNextRender(() => {
      this.homeService.menus().subscribe((resp:any) => {
        console.log(resp);
        this.categories_menus = resp.categories_menus ?? [];
        this.cdr.detectChanges();
        this.syncSearchCategorySelect();
      })
      this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'EUR';
    })
    afterRender(() => {
      setTimeout(() => {
        this.isLoading = true;
        setTimeout(() => {
          CurrecyChange($);
        }, 50);
      }, 50);
    })
  }

  ngOnInit(): void {
    this.cartService.authService.currentUser$.subscribe((user:any) => {
      this.user = user;
      this.cartService.resetCart();
      if(this.user){
        this.loadUserCart();
      }
    })

    this.cartService.currentDataCart$.subscribe((resp:any) => {
      // console.log(resp);
      this.listCarts = resp;
      this.totalCarts = this.listCarts.reduce((sum:number, item:any) => sum + item.total, 0);
    })
  }
  logout(){
    this.cartService.authService.logout();
  }

  loadUserCart(){
    this.cartService.listCart().subscribe((resp:any) => {
      console.log(resp);
      resp.carts.data.forEach((cart:any) => {
        if(cart.currency != this.currency){
          this.cookieService.set("currency",cart.currency);
          setTimeout(() => {
            window.location.reload();
          }, 25);
        }
        this.cartService.changeCart(cart)
      });
    })
  }
  deleteCart(CART:any) {
    this.cartService.deleteCart(CART.id).subscribe((resp:any) => {
      this.toastr.info("Eliminación","Se elimino el producto "+CART.product.title + " del carrito de compra");
      this.cartService.removeCart(CART);
    })
  }

  getIconMenu(menu:any){
    var miDiv:any = document.getElementById('icon-'+menu.id);
    miDiv.innerHTML = menu.icon; 
    return '';
  }

  private syncSearchCategorySelect(attempt:number = 0){
    setTimeout(() => {
      const categorySelect = $('.tp-header-search-category select');

      if(!categorySelect.length){
        return;
      }

      if(categorySelect.find('option').length <= 1 && attempt < 5){
        this.syncSearchCategorySelect(attempt + 1);
        return;
      }

      if(typeof categorySelect.niceSelect === 'function'){
        if(categorySelect.next('.nice-select').length){
          categorySelect.niceSelect('update');
        }else{
          categorySelect.niceSelect();
        }
      }

      categorySelect
        .off('change.headerSearchCategory')
        .on('change.headerSearchCategory', (event:any) => {
          this.selectedCategoryId = event.target.value;
        });
    }, 50);
  }

  changeCurrency(val:string){
    if(this.user){
      this.cartService.deleteCartsAll().subscribe((resp:any) => {
        this.cookieService.set("currency",val);
        window.location.reload();
        console.log(resp);
      })
    }else{
      this.cookieService.set("currency",val);
      setTimeout(() => {
        window.location.reload();
      }, 25);
    }
  }

  searchProduct(){
    const queryParams = new URLSearchParams({
      search: this.searchT,
    });

    if(this.selectedCategoryId){
      queryParams.set("category_id", this.selectedCategoryId);
    }

    window.location.href = "/productos-busqueda?"+queryParams.toString();
  }
}
