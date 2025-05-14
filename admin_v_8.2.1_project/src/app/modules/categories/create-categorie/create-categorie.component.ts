import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CategoriesService } from '../service/categories.service';

@Component({
  selector: 'app-create-categorie',
  templateUrl: './create-categorie.component.html',
  styleUrls: ['./create-categorie.component.scss']
})
export class CreateCategorieComponent {

  type_categorie: number = 1;

  name:string = '';
  icon :string = '';
  position : number = 1;
  categorie_second_id : string = '';
  categorie_third_id : string = '';

  image_previsualiza:any = 'https://preview.keenthemes.com/metronic8/demo1/assets/media/svg/illustrations/easy/2.svg';
  file_image:any = null;

  isLoading$: any;

constructor(
  public categoriesService: CategoriesService,
  public toastr: ToastrService,
) { }

  ngOnInit(): void {
    this.isLoading$ = this.categoriesService.isLoading$;
  }

  processFile($event:any){
    if($event.target.files[0].type.indexOf('image') < 0){
      this.toastr.error('Validacion','El archivo no es una imagen');
       return;
    }
    this.file_image = $event.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(this.file_image);
    reader.onloadend = () => this.image_previsualiza = reader.result;
    this.isLoadingView();
  }

  isLoadingView(){
    this.categoriesService.isLoadingSubject.next(true);
    setTimeout(() => {
      this.categoriesService.isLoadingSubject.next(false);
    }, 50);
  }

  changeTypeCategorie(val:number){
    this.type_categorie = val;
  }

  save(){

    if(!this.name || !this.icon || !this.position){
      this.toastr.error('Validacion','Los campos con el * son obligatorios');
      return;
    }

    if(this.type_categorie == 1 && !this.file_image){
      this.toastr.error('Validacion','La imagen es obligatoria');
      return;
      }
    

    if(this.type_categorie == 2 && !this.categorie_second_id){
      this.toastr.error('Validacion','El departamento es obligatorio');
      return;
    }

    if(this.type_categorie == 3 && (!this.categorie_second_id || !this.categorie_third_id)){
      this.toastr.error('Validacion','El departamento y la categoría es obligatorio');
      return;
    }

    let formDAta = new FormData();
    formDAta.append('name',this.name);
    formDAta.append('icon',this.icon);
    formDAta.append('position',this.position+"");
    formDAta.append('type_categorie',this.type_categorie+"");

    if(this.file_image){
      formDAta.append('image',this.file_image);
    }

    if(this.categorie_second_id){
      formDAta.append('categorie_second_id',this.categorie_second_id);
    }
    if(this.categorie_third_id){
      formDAta.append('categorie_third_id',this.categorie_third_id);
    }

    this.categoriesService.createCategories(formDAta).subscribe((resp:any)=>{
      console.log(resp);
    })

  }
}
