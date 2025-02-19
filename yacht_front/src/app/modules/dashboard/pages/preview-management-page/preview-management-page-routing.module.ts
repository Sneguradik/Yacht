import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PreviewManagementPageComponent } from './preview-management-page.component';

const routes: Routes = [
  {
    path: '',
    component: PreviewManagementPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreviewManagementPageRoutingModule { }
