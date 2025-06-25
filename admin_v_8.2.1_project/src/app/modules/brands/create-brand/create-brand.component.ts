import { Component, EventEmitter, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { BrandService } from '../service/brand.service';

@Component({
  selector: 'app-create-brand',
  templateUrl: './create-brand.component.html',
  styleUrls: ['./create-brand.component.scss']
})
export class CreateBrandComponent {

  @Output() BrandC: EventEmitter<any> = new EventEmitter();
  
  name: string = '';
  isLoading$: any;
  constructor(
    public brandService: BrandService, // Replace with actual service type
    public modal: NgbActiveModal,
    public toastr: ToastrService,
  ) {

  }

  ngOnInit(): void {
    this.isLoading$ = this.brandService.isLoading$;
  }

  store(){
    if(!this.name){
      this.toastr.error('Validacion','Todos los campos son necesarios');
      return;
    }
    let data = {
      name: this.name,
      state: 1,
    };

    this.brandService.createBrands(data).subscribe((resp:any) =>{
      console.log(resp);
      if(resp.message == 403){
        this.toastr.error('Validación','El nombre de la marca ya existe en la base de datos');
        return;
      }else{
        this.BrandC.emit(resp.brand);
        this.toastr.success('Exitos','La marca se ha registrado correctamente');
        this.modal.close();
      }
    })
  }

}
