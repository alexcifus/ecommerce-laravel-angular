import { Component } from '@angular/core';
import { AttributesService } from '../../service/attributes.service';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-variation-specifications',
  templateUrl: './create-variation-specifications.component.html',
  styleUrls: ['./create-variation-specifications.component.scss']
})
export class CreateVariationSpecificationsComponent {

  title:string = '';
  sku:string = '';
  isLoading$: any;

  specification_attribute_id:string = '';
  type_attribute_specification:number = 1;
  variations_attribute_id:string = '';
  type_attribute_variation:number = 4;
  attributes:any = [];

  dropdownList:any = [];
  selectedItems:any = [];//CAMPO_4
  dropdownSettings:IDropdownSettings = {};
  word:string = '';
  
  isShowMultiselect:boolean = false;
  PRODUCT_ID:string = '';
  PRODUCT_SELECTED:any;

  campo_1:string = '';
  campo_2:number = 0;
  campo_3:any;

  campo_1_variation:any;
  dropdownListVariations: any = [];
  selectedItemsVariations: any = [];
  precio_add:number = 0;
  stock_add:number = 0;
  constructor(
    public attributeService: AttributesService,
    public toastr: ToastrService,
    private activeRoute: ActivatedRoute,
    public modalService: NgbModal,
  ){

  }
  
  ngOnInit(): void {
    this.isLoading$ = this.attributeService.isLoading$;

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

    this.activeRoute.params.subscribe((resp:any) => {
      console.log(resp);
      this.PRODUCT_ID = resp.id;
    });

    this.showProduct();

  }

  showProduct(){
    this.attributeService.showProduct(this.PRODUCT_ID).subscribe((resp:any) => {
    console.log(resp);
    this.PRODUCT_SELECTED = resp.product;
    this.title = resp.product.title;
    this.sku = resp.product.sku;

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

   onItemSelect(item: any) {
      console.log(item);
    }

  onSelectAll(items: any) {
      console.log(items);
    }

  isLoadingView(){
    this.attributeService.isLoadingSubject.next(true);
    setTimeout(() => {
      this.attributeService.isLoadingSubject.next(false);
    }, 50);
  }

  save(){
    
  }
  

}
