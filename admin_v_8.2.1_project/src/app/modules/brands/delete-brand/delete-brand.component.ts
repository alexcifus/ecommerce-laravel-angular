import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { BrandService } from '../service/brand.service';

@Component({
  selector: 'app-delete-brand',
  templateUrl: './delete-brand.component.html',
  styleUrls: ['./delete-brand.component.scss']
})
export class DeleteBrandComponent {

  @Input() brand:any;
  
    @Output() BrandD: EventEmitter<any> = new EventEmitter();
    isLoading:any;
    constructor(
      public brandService: BrandService,
      public toastr: ToastrService,
      public modal: NgbActiveModal,
    ) {
  
    }
  
    ngOnInit(): void {
      this.isLoading = this.brandService.isLoading$;
    }
    delete(){
      
      this.brandService.deleteBrands(this.brand.id).subscribe((resp:any)=>{
        this.BrandD.emit({message:200});
        this.modal.close();
      })
    }

}
