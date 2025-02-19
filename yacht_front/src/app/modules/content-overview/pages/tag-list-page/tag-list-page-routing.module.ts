import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TagListPageComponent } from './tag-list-page.component';

const routes: Routes = [
  {
    path: '',
    component: TagListPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TagListPageRoutingModule { }
