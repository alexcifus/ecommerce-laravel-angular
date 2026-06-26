import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoriesService } from '../service/categories.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-delete-categorie',
  templateUrl: './delete-categorie.component.html',
  styleUrls: ['./delete-categorie.component.scss']
})
export class DeleteCategorieComponent {

  @Input() categorie:any;

  @Output() CategorieD: EventEmitter<any> = new EventEmitter();
  isLoading:any;
  constructor(
    public categoriesService: CategoriesService,
    public toastr: ToastrService,
    public modal: NgbActiveModal,
  ) {

  }

  ngOnInit(): void {
    this.isLoading = this.categoriesService.isLoading$;
  }
  delete(){
    
    this.categoriesService.deleteCategorie(this.categorie.id).subscribe((resp:any)=>{
      if(resp.message == 403){
        this.toastr.error('Validacion',resp.message_text);
      }else{
        this.toastr.success('Categoria eliminada correctamente');
        this.CategorieD.emit({message:200});
        this.modal.close();
      }
    },(err:any) => {
      this.toastr.error(
        'No se pudo eliminar la categoria',
        err.error?.message_text || err.error?.message || 'Revise si la categoria tiene relaciones o contacte con el desarrollador.'
      );
    })
  }

}
