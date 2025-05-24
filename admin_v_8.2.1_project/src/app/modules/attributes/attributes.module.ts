import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AttributesRoutingModule } from './attributes-routing.module';
import { AttributesComponent } from './attributes.component';
import { CreateAttributeComponent } from './create-attribute/create-attribute.component';
import { EditeAttributeComponent } from './edite-attribute/edite-attribute.component';
import { DeleteAttributeComponent } from './delete-attribute/delete-attribute.component';
import { ListAttributeComponent } from './list-attribute/list-attribute.component';
import { SubAttributeCreateComponent } from './sub-attribute-create/sub-attribute-create.component';
import { SubAttributeDeleteComponent } from './sub-attribute-delete/sub-attribute-delete.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { NgbModalModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    AttributesComponent,
    CreateAttributeComponent,
    EditeAttributeComponent,
    DeleteAttributeComponent,
    ListAttributeComponent,
    SubAttributeCreateComponent,
    SubAttributeDeleteComponent
  ],
  imports: [
    CommonModule,
    AttributesRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    InlineSVGModule,
    NgbModalModule,
    NgbPaginationModule,
  ]
})
export class AttributesModule { }
