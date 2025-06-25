import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from '../service/product.service';

@Component({
  selector: 'app-delete-product',
  templateUrl: './delete-product.component.html',
  styleUrls: ['./delete-product.component.scss']
})
export class DeleteProductComponent {

    @Input() product:any;
  
    @Output() ProductD: EventEmitter<any> = new EventEmitter();
    isLoading:any;
    constructor(
      public productService: ProductService,
      public toastr: ToastrService,
      public modal: NgbActiveModal,
    ) {
  
    }
  
    ngOnInit(): void {
      this.isLoading = this.productService.isLoading$;
    }
    delete(){
      this.productService.deleteProduct(this.product.id).subscribe((resp:any)=>{
        this.ProductD.emit({message:200});
        this.modal.close();
      })
    }

}
