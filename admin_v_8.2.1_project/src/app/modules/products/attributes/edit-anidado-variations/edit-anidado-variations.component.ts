import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ToastrService } from 'ngx-toastr';
import { AttributesService } from '../../service/attributes.service';

@Component({
  selector: 'app-edit-anidado-variations',
  templateUrl: './edit-anidado-variations.component.html',
  styleUrls: ['./edit-anidado-variations.component.scss']
})
export class EditAnidadoVariationsComponent {
  @Output() EspecificationE: EventEmitter<any> = new EventEmitter();
    
    @Input() specification:any
    @Input() attributes_variations:any = [];
    @Input() is_variation:any;//FALSE VA A SER UNA EDICION PARA LAS ESPECIFICACIONES Y SI ES TRUE UNA EDICION PARA LAS VARIACIONES
    
    isLoading$: any;
  
    specification_attribute_id:string = '';
    type_attribute_specification:number = 1;
    variations_attribute_id:string = '';
    type_attribute_variation:number = 4;
    attributes:any = [];
  
    dropdownList:any = [];
    selectedItems:any = [];//CAMPO_4
    dropdownSettings:IDropdownSettings = {};
  
    @Input() attributes_specifications: any = [];
    properties: any = [];
    propertie_id:any = null;
    value_add:any = null;
    specifications:any = [];
  
  
    precio_add:any = 0; // add_price
    stock_add:any = 0; // stock
    constructor(
      public attributeService: AttributesService, // Replace with actual service type
      public modal: NgbActiveModal,
      private toastr: ToastrService,
    ) {
  
    }
    
    ngOnInit(): void {
  
  
      this.isLoading$ = this.attributeService.isLoading$;
  
      this.dropdownSettings = {
        singleSelection: false,
        idField: 'id',
        textField: 'name',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        // itemsShowLimit: 3,
        allowSearchFilter: true
      };
  
      if(!this.is_variation){
        this.specification_attribute_id = this.specification.attribute_id;
        this.changeSpecifications();
      }else{
        this.variations_attribute_id = this.specification.attribute_id;
        console.log(this.variations_attribute_id);
        this.changeVariations();
      }
      // setTimeout(() => {
        setTimeout(() => {
          let old_type_attribute = this.type_attribute_specification;
          this.propertie_id = this.specification.propertie_id ? this.specification.propertie_id : null;
          if(this.specification.attribute.type_attribute == 4){
            this.type_attribute_specification = 0;
            this.selectedItems = this.specification.value_add ? JSON.parse(this.specification.value_add) : null;
            setTimeout(() => {
              this.type_attribute_specification = old_type_attribute;
            }, 25);
          }else{
          this.value_add = this.specification.value_add ? this.specification.value_add : null;
          }
        }, 25);
        if(this.is_variation){
          this.precio_add = this.specification.add_price;
          this.stock_add = this.specification.stock;
        }
      // }, 50);
    }
  
    store(){
      if(!this.is_variation){
        this.storeSpecification();
      }else{
        this.storeVariation();
      }
    }
      
    storeSpecification(){
  
      if(this.type_attribute_specification == 4 && this.selectedItems.length == 0){
        this.toastr.error('Validación', 'Necesitas seleccionar algunos items');
        return;
      } 
      if(this.selectedItems.length > 0){
        this.value_add = JSON.stringify(this.selectedItems);
      }
      if(!this.specification_attribute_id || ( !this.propertie_id && !this.value_add)){
        this.toastr.error('Validación', 'Llene los campos necesarios');
        return;
      }
      let data = {
        product_id: this.specification.product_id,
        attribute_id: this.specification_attribute_id,
        propertie_id: this.propertie_id,
        value_add: this.value_add,
      }
  
      this.attributeService.updateSpecification(this.specification.id,data).subscribe((resp:any) =>{
        console.log(resp);
        if(resp.message == 403){
        this.toastr.error('Validación', resp.message_text);
        }else{
          this.toastr.success('Éxito', "se ha actualizado la especificación correctamente");
          this.EspecificationE.emit(resp);
          this.modal.close();
        }
      })
    }
  
    storeVariation(){
  
        if(!this.variations_attribute_id || ( !this.propertie_id && !this.value_add)){
        this.toastr.error('Validación', 'Llene los campos necesarios');
        return;
      }
      let data = {
        product_id: this.specification.product_id,
        attribute_id: this.variations_attribute_id,
        propertie_id: this.propertie_id,
        value_add: this.value_add,
        add_price: this.precio_add,
        stock: this.stock_add,
        product_variation_id: this.specification.product_variation_id,
      }
  
      this.attributeService.updateVariationsAnidadas(this.specification.id,data).subscribe((resp:any) =>{
        console.log(resp);
        if(resp.message == 403){
        this.toastr.error('Validación', resp.message_text);
        }else{
          this.toastr.success('Éxito', "se ha actualizado la variación ANIDADA correctamente");
          this.EspecificationE.emit(resp);
          this.modal.close();
        }
      })
    }
  
    onItemSelect(item: any) {
        console.log(item);
      }
    onSelectAll(items: any) {
        console.log(items);
      }
  
    changeSpecifications() {
      this.value_add = null;
      this.propertie_id = null;
      this.selectedItems = [];
      let ATTRIBUTE = this.attributes_specifications.find((item:any) => item.id == this.specification_attribute_id);
      if (ATTRIBUTE) {
        this.type_attribute_specification = ATTRIBUTE.type_attribute;
        if(this.type_attribute_specification == 3 || this.type_attribute_specification == 4){
          this.properties = ATTRIBUTE.properties;
          this.dropdownList = ATTRIBUTE.properties;
        }else{
          this.properties = [];
          this.dropdownList = [];
        }
      } else {
        this.type_attribute_specification = 0;
        this.properties = [];
        this.dropdownList = [];
      } 
    }
  
    changeVariations() {
      this.value_add = null;
      this.propertie_id = null;
      let ATTRIBUTE = this.attributes_variations.find((item:any) => item.id == this.variations_attribute_id);
      if (ATTRIBUTE) {
        this.type_attribute_specification = ATTRIBUTE.type_attribute;
        if(this.type_attribute_specification == 3 || this.type_attribute_specification == 4){
          this.properties = ATTRIBUTE.properties;
        }else{
          this.properties = [];
        }
      } else {
        this.type_attribute_specification = 0;
        this.properties = [];
      } 
    }
}
