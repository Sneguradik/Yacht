import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PopularPageComponent } from './popular-page.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'day'
  },
  {
    path: ':when',
    component: PopularPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PopularPageRoutingModule { }
