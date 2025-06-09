import { Component } from '@angular/core';
import { ProductService } from '../service/product.service';
import { ToastrService } from 'ngx-toastr';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss']
})
export class CreateProductComponent {

  title:string = '';
  sku:string = '';
  resumen:string = '';
  price_eur :number = 0;
  price_usd :number = 0;
  description:any = "<p> Hello World!</p>";
  imagen_previsualiza:any = 'https://preview.keenthemes.com/metronic8/demo1/assets/media/svg/illustrations/easy/2.svg';
  file_imagen:any = null;
  marca_id: string = '';
  marcas:any = [];
  config: any = {
    versionCheck: false,
  }

  isLoading$: any;

  categorie_first_id: string = '';
  categorie_second_id: string = '';
  categorie_third_id: string = '';
  categories_first:any = [];
  categories_seconds:any = [];
  categories_seconds_backups:any = [];
  categories_thirds:any = [];
  categories_thirds_backups:any = [];

  dropdownList:any = [];
  selectedItems:any = [];
  dropdownSettings:IDropdownSettings = {};
  

  constructor(
    public productService: ProductService,
    public toastr: ToastrService,
  ) {

  }
  
  ngOnInit(): void {
    this.isLoading$ = this.productService.isLoading$;

    this.dropdownList = [
      { item_id: 1, item_text: 'Mumbai' },
      { item_id: 2, item_text: 'Bangaluru' },
      { item_id: 3, item_text: 'Pune' },
      { item_id: 4, item_text: 'Navsari' },
      { item_id: 5, item_text: 'New Delhi' },
      { item_id: 6, item_text: 'Laravest' }
    ];
    this.selectedItems = [
      { item_id: 3, item_text: 'Pune' },
      { item_id: 4, item_text: 'Navsari' },      
      { item_id: 6, item_text: 'Laravest' }
    ];
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      // itemsShowLimit: 3,
      allowSearchFilter: true
    };
  }

  processFile($event:any){
    if($event.target.files[0].type.indexOf('image') < 0){
      this.toastr.error('Validacion','El archivo no es una imagen');
        return;
    }
    this.file_imagen = $event.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(this.file_imagen);
    reader.onloadend = () => this.imagen_previsualiza = reader.result;
    this.isLoadingView();
  }

  isLoadingView(){
    this.productService.isLoadingSubject.next(true);
    setTimeout(() => {
      this.productService.isLoadingSubject.next(false);
    }, 50);
  }

  changeDepartamento(){
    this.categories_seconds_backups = this.categories_seconds.filter((item:any) => 
    item.categorie_second_id == this.categorie_first_id
  )

  }
  changeCategorie(){
    this.categories_thirds_backups = this.categories_thirds.filter((item:any) => 
      item.categorie_second_id == this.categorie_second_id
    )

  }

  onItemSelect(item: any) {
      console.log(item);
    }

  onSelectAll(items: any) {
      console.log(items);
    }

  save(){

    if(!this.title || !this.file_imagen){
      this.toastr.error('Validacion','Los campos con el * son obligatorios');
      return;
    }

    let formDAta = new FormData();
    formDAta.append('title',this.title);
    formDAta.append('image',this.file_imagen);
    
    this.productService.createProducts(formDAta).subscribe((resp:any)=>{
      console.log(resp);

      this.title = '';
      this.file_imagen = null;
      this.imagen_previsualiza = 'https://preview.keenthemes.com/metronic8/demo1/assets/media/svg/illustrations/easy/2.svg';
      this.toastr.success('Exito','El producto se refistró correctamente');
    })
  }

  public onChange(event:any) {
    this.description = event.editor.getData(); // Para obtener el valor del textarea
  }

}
