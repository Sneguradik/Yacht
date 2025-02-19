import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: ':id/edit',
    loadChildren: () => import('./pages/news-edit-page/news-edit-page.module').then((module: any) => module.NewsEditPageModule)
  },
  {
    path: ':id',
    loadChildren: () => import('./pages/news-page/news-page.module').then((module: any) => module.NewsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewsRoutingModule { }
