import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PreviewManagementPageRoutingModule } from './preview-management-page-routing.module';
import { PreviewManagementPageComponent } from './preview-management-page.component';
import { PreviewManagementBlockComponent } from './preview-management-block/preview-management-block.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [PreviewManagementPageComponent, PreviewManagementBlockComponent],
  imports: [
    CommonModule,
    PreviewManagementPageRoutingModule,
    FormsModule
  ]
})
export class PreviewManagementPageModule { }
