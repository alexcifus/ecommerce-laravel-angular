import { Component } from '@angular/core';
import { SlidersService } from '../service/sliders.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-sliders',
  templateUrl: './create-sliders.component.html',
  styleUrls: ['./create-sliders.component.scss']
})
export class CreateSlidersComponent {

  title:string = '';
  label:string = '';
  subtitle:string = '';
  link:string = '';
  color:string = '';
  
  imagen_previsualiza:any = 'https://preview.keenthemes.com/metronic8/demo1/assets/media/svg/illustrations/easy/2.svg';
  file_imagen:any = null;

  isLoading$: any;
  
  constructor(
    public slidersService: SlidersService,
    public toastr: ToastrService,
  ) {

  }
  
  ngOnInit(): void {
    this.isLoading$ = this.slidersService.isLoading$;
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
    this.slidersService.isLoadingSubject.next(true);
    setTimeout(() => {
      this.slidersService.isLoadingSubject.next(false);
    }, 50);
  }

  save(){

    if(!this.title || !this.subtitle || !this.file_imagen){
      this.toastr.error('Validacion','Los campos con el * son obligatorios');
      return;
    }

    let formDAta = new FormData();
    formDAta.append('title',this.title);
    if(this.label){
      formDAta.append('label',this.label);
    }
    formDAta.append('subtitle',this.subtitle+"");
    
    formDAta.append('image',this.file_imagen);
    if(this.link){
    formDAta.append('link',this.link);
    }
    
    if(this.color){
      formDAta.append('color',this.color);
    }
    
    this.slidersService.createSliders(formDAta).subscribe((resp:any)=>{
      console.log(resp);

      this.title = '';
      this.label = '';
      this.subtitle = '';
      this.link = '';
      this.color = '';
      this.file_imagen = null;
      this.imagen_previsualiza = 'https://preview.keenthemes.com/metronic8/demo1/assets/media/svg/illustrations/easy/2.svg';
      this.toastr.success('Exito','El slider se refistró correctamente');
    })
  }
}
