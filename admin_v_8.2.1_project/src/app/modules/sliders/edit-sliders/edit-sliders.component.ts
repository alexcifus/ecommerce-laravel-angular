import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SlidersService } from '../service/sliders.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-sliders',
  templateUrl: './edit-sliders.component.html',
  styleUrls: ['./edit-sliders.component.scss']
})
export class EditSlidersComponent {

  title:string = '';
  label:string = '';
  subtitle:string = '';
  link:string = '';
  color:string = '';
  state:number = 1;  
  imagen_previsualiza:any = 'https://preview.keenthemes.com/metronic8/demo1/assets/media/svg/illustrations/easy/2.svg';
  file_imagen:any = null;

  isLoading$: any;

  slider_id:string = '';
  
  constructor(
    public slidersService: SlidersService,
    public toastr: ToastrService,
    public activedRoute: ActivatedRoute,
  ) {

  }
  
  ngOnInit(): void {
    this.isLoading$ = this.slidersService.isLoading$;
    this.activedRoute.params.subscribe((resp:any)=>{
      this.slider_id = resp.id;
    })

    this.slidersService.showSlider(this.slider_id).subscribe((resp:any)=>{
      console.log(resp);
      this.title = resp.slider.title;
      this.label = resp.slider.label;
      this.subtitle = resp.slider.subtitle;
      this.link = resp.slider.link;
      this.color = resp.slider.color;
      this.state = resp.slider.state;
      this.imagen_previsualiza = resp.slider.imagen;
    })
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

    if(!this.title || !this.subtitle){
      this.toastr.error('Validacion','Los campos con el * son obligatorios');
      return;
    }

    let formDAta = new FormData();
    formDAta.append('title',this.title);
    if(this.label){
      formDAta.append('label',this.label);
    }
    formDAta.append('subtitle',this.subtitle+"");
    if(this.file_imagen){
      formDAta.append('image',this.file_imagen);
    }
    if(this.link){
    formDAta.append('link',this.link);
    }
    
    if(this.color){
      formDAta.append('color',this.color);
    }
    formDAta.append('state', this.state.toString());
    
    this.slidersService.updateSliders(this.slider_id,formDAta).subscribe((resp:any)=>{
      console.log(resp);
      this.toastr.success('Exito','El slider se editó correctamente');
    })
  }

}
