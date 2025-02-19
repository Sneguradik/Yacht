import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NewsEditPageComponent } from './news-edit-page.component';


const routes: Routes = [
  {
    path: '',
    component: NewsEditPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewsEditPageRoutingModule { }
