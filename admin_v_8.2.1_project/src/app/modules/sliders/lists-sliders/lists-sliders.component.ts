import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoriesService } from '../../categories/service/categories.service';
import { DeleteSlidersComponent } from '../delete-sliders/delete-sliders.component';
import { SlidersService } from '../service/sliders.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-lists-sliders',
  templateUrl: './lists-sliders.component.html',
  styleUrls: ['./lists-sliders.component.scss']
})
export class ListsSlidersComponent {

  sliders: any[];
  search: string = '';
  totalPages: number = 0;
  currentPage: number = 1;

  isLoading$: any;
  constructor(
    public sliderService: SlidersService,
    public modalService: NgbModal,
    public toastr: ToastrService,
  ) {

  }

  ngOnInit(): void {
    this.listSliders();
    this.isLoading$ = this.sliderService.isLoading$;  
  }
  listSliders(page = 1){
    this.sliderService.listSliders(page,this.search).subscribe((resp:any)=>{
      console.log(resp);
      this.sliders = resp.sliders;
      this.totalPages = resp.total;
      this.currentPage = page;
    },(err:any) => {
        console.log(err);
        this.toastr.error('API RESPONSE - COMUNIQUESE CON EL DESARROLLADOR', err.error.message,);
      })
  }

  searchTo(){
    this.listSliders();
  }
  loadPage($event:any){
    console.log($event);
    this.listSliders($event);

  }

  deleteSlider(slider:any){
    const modalRef = this.modalService.open(DeleteSlidersComponent, {centered: true, size: 'md'});
    modalRef.componentInstance.slider = slider;

    modalRef.componentInstance.SliderD.subscribe((resp:any)=>{
      let INDEX = this.sliders.findIndex((item:any) => item.id == slider.id);
      if(INDEX != -1){
        this.sliders.splice(INDEX,1);
      }
    })
  }
}