import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthorListPageComponent } from './author-list-page.component';

const routes: Routes = [
  {
    path: '',
    component: AuthorListPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthorListPageRoutingModule { }
