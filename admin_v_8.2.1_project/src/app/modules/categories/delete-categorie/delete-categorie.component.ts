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
      this.CategorieD.emit({message:200});
      this.modal.close();
    })
  }

}