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
  word:string = '';
  
  isShowMultiselect:boolean = false;
  constructor(
    public productService: ProductService,
    public toastr: ToastrService,
  ){

  }
  
  ngOnInit(): void {
    this.isLoading$ = this.productService.isLoading$;

    // this.dropdownList = [
    //   { item_id: 1, item_text: 'Mumbai' },
    //   { item_id: 2, item_text: 'Bangaluru' },
    //   { item_id: 3, item_text: 'Pune' },
    //   { item_id: 4, item_text: 'Navsari' },
    //   { item_id: 5, item_text: 'New Delhi' },
    //   { item_id: 6, item_text: 'Laravest' }
    // ];
    // this.selectedItems = [
    //   { item_id: 3, item_text: 'Pune' },
    //   { item_id: 4, item_text: 'Navsari' },      
    //   { item_id: 6, item_text: 'Laravest' }
    // ];
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      // itemsShowLimit: 3,
      allowSearchFilter: true
    };
    this.configAll();
  }

  configAll(){
    this.productService.configAll().subscribe((resp:any) => {
      console.log(resp);
      this.marcas = resp.brands;
      this.categories_first = resp.categories_first;
      this.categories_seconds = resp.categories_seconds;
      this.categories_thirds = resp.categories_thirds;
      
    })
  }

  addItems() {
    this.isShowMultiselect = true;
    let time_date = new Date().getTime();
    this.dropdownList.push({ item_id: time_date, item_text: this.word });
    this.selectedItems.push({ item_id: time_date, item_text: this.word });
    setTimeout(() => {
      this.word = '';
      this.isShowMultiselect = false;
      this.isLoadingView();
    }, 100);
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

    if(!this.title || !this.file_imagen || !this.sku || !this.price_usd || !this.price_eur || !this.marca_id 
      || !this.categorie_first_id || !this.description || !this.resumen || (this.selectedItems == 0)){
      this.toastr.error('Validacion','Los campos con el * son obligatorios');
      return;
    }

    let formDAta = new FormData();
    formDAta.append('title',this.title);
    formDAta.append('sku',this.sku);
    formDAta.append('price_usd',this.price_usd+"");
    formDAta.append('price_eur',this.price_eur+"");
    formDAta.append('brand_id',this.marca_id);
    formDAta.append('portada',this.file_imagen);
    formDAta.append('categorie_first_id',this.categorie_first_id);
    if(this.categorie_second_id){
      formDAta.append('categorie_second_id',this.categorie_second_id);
    }
    if(this.categorie_third_id){
      formDAta.append('categorie_third_id',this.categorie_third_id);
    }
    formDAta.append('description',this.description);
    formDAta.append('resumen',this.resumen);
    formDAta.append('multiselect',JSON.stringify(this.selectedItems));
        
    this.productService.createProducts(formDAta).subscribe((resp:any)=>{
      console.log(resp);

      if(resp.message == 403){
        this.toastr.success('Validación',resp.message_text);
      }else{
        this.title = '';
        this.file_imagen = null;
        this.sku = '';
        this.price_usd = 0;
        this.price_eur = 0;
        this.categorie_first_id = '';
        this.categorie_second_id = '';
        this.categorie_third_id = '';
        this.description = '';
        this.resumen = '';
        this.selectedItems = [];

        this.imagen_previsualiza = 'https://preview.keenthemes.com/metronic8/demo1/assets/media/svg/illustrations/easy/2.svg';
        this.toastr.success('Exito','El producto se registró correctamente');
      }

    })
  }

  public onChange(event:any) {
    this.description = event.editor.getData(); // Para obtener el valor del textarea
  }

}
