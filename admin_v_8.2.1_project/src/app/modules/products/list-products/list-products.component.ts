import { Component } from '@angular/core';
import { ProductService } from '../service/product.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteProductComponent } from '../delete-product/delete-product.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-list-products',
  templateUrl: './list-products.component.html',
  styleUrls: ['./list-products.component.scss']
})
export class ListProductsComponent {

  products: any[];
    search: string = '';
    totalPages: number = 0;
    currentPage: number = 1;
  
    isLoading$: any;
    constructor(
      public productService: ProductService,
      public modalService: NgbModal,
      public toastr: ToastrService,
    ) {
  
    }
  
    ngOnInit(): void {
      this.listProducts();
      this.isLoading$ = this.productService.isLoading$;  
    }
    listProducts(page = 1){
      this.productService.listProducts(page,this.search).subscribe((resp:any)=>{
        console.log(resp);
        this.products = resp.products.data;
        this.totalPages = resp.total;
        this.currentPage = page;
      },(err:any) => {
        console.log(err);
        this.toastr.error('API RESPONSE - COMUNIQUESE CON EL DESARROLLADOR', err.error.message,);
      })
    }
  
    searchTo(){
      this.listProducts();
    }
    loadPage($event:any){
      console.log($event);
      this.listProducts($event);
  
    }
  
    deleteProduct(product:any){
      const modalRef = this.modalService.open(DeleteProductComponent, {centered: true, size: 'md'});
      modalRef.componentInstance.product = product;
  
      modalRef.componentInstance.ProductD.subscribe((resp:any)=>{
        let INDEX = this.products.findIndex((item:any) => item.id == product.id);
        if(INDEX != -1){
          this.products.splice(INDEX,1);
        }
      })
    }

}
