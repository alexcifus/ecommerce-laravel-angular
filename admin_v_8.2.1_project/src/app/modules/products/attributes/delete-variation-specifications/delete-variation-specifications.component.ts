import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AttributesService } from '../../service/attributes.service';

@Component({
  selector: 'app-delete-variation-specifications',
  templateUrl: './delete-variation-specifications.component.html',
  styleUrls: ['./delete-variation-specifications.component.scss']
})
export class DeleteVariationSpecificationsComponent {
@Input() specification:any;
  
@Output() EspecificationD: EventEmitter<any> = new EventEmitter();
isLoading:any;
constructor(
  public attributeService: AttributesService,
  public toastr: ToastrService,
  public modal: NgbActiveModal,
) {

}

ngOnInit(): void {
  this.isLoading = this.attributeService.isLoading$;
}
delete(){
  this.attributeService.deleteSpecification(this.specification.id).subscribe((resp:any)=>{
    this.EspecificationD.emit({message:200});
    this.modal.close();
  })
}
}
