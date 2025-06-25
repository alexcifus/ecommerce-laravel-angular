import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { BrandService } from '../service/brand.service';

@Component({
  selector: 'app-edit-brand',
  templateUrl: './edit-brand.component.html',
  styleUrls: ['./edit-brand.component.scss']
})
export class EditBrandComponent {

  @Output() BrandE: EventEmitter<any> = new EventEmitter();
  @Input() brand: any; // Replace with actual brand type
  
  name: string = '';
  isLoading$: any;
  state: number = 1; // Assuming state is a number, adjust as necessary
  constructor(
    public brandService: BrandService, // Replace with actual service type
    public modal: NgbActiveModal,
    public toastr: ToastrService,
  ) {

  }

  ngOnInit(): void {
    this.isLoading$ = this.brandService.isLoading$;
    this.name = this.brand.name; // Assuming brand has a name property
    this.state = this.brand.state; // Assuming brand has a state property
  }

  store(){
    if(!this.name){
      this.toastr.error('Validacion','Todos los campos son necesarios');
      return;
    }
    let data = {
      name: this.name,
      state: this.state,
    };

    this.brandService.updateBrands(this.brand.id, data).subscribe((resp:any) =>{
      console.log(resp);
      if(resp.message == 403){
        this.toastr.error('Validación','El nombre de la marca ya existe en la base de datos');
        return;
      }else{
        this.BrandE.emit(resp.brand);
        this.toastr.success('Exitos','La marca se ha editado correctamente');
        this.modal.close();
      }
    })
  }

}
