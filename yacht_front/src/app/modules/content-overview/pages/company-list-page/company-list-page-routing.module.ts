import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CompanyListPageComponent } from './company-list-page.component';

const routes: Routes = [
  {
    path: '',
    component: CompanyListPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyListPageRoutingModule { }
