import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AttributesService } from '../service/attributes.service';

@Component({
  selector: 'app-edite-attribute',
  templateUrl: './edite-attribute.component.html',
  styleUrls: ['./edite-attribute.component.scss']
})
export class EditeAttributeComponent {

  @Output() AttributeE: EventEmitter<any> = new EventEmitter();

  @Input() attribute:any
  
    name: string = '';
    type_attribute: number = 1;
    isLoading$: any;
    constructor(
      public attributesService: AttributesService, // Replace with actual service type
      public modal: NgbActiveModal,
      public toastr: ToastrService,
    ) {
  
    }
  
    ngOnInit(): void {
      this.isLoading$ = this.attributesService.isLoading$;
      this.name = this.attribute.name;
      this.type_attribute = this.attribute.type_attribute;
    }
  
    store(){
      if(!this.name || !this.type_attribute){
        this.toastr.error('Validacion','Todos los campos son necesarios');
        return;
      }
      let data = {
        name: this.name,
        type_attribute: this.type_attribute,
        state: 1,
      };
  
      this.attributesService.updateAttributes(this.attribute.id,data).subscribe((resp:any) =>{
        console.log(resp);
        if(resp.message == 403){
          this.toastr.error('Validación','El nombre del atributo ya existe en la base de datos');
          return;
        }else{
          this.AttributeE.emit(resp.attribute);
          this.toastr.success('Exitos','El  atributo se ha editado correctamente');
          this.modal.close();
        }
      })
    }
}
