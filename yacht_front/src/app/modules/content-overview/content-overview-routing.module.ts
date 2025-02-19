import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'topics',
    loadChildren: () => import('./pages/topic-list-page/topic-list-page.module').then((module: any) => module.TopicListPageModule)
  },
  {
    path: 'tags',
    loadChildren: () => import('./pages/tag-list-page/tag-list-page.module').then((module: any) => module.TagListPageModule)
  },
  {
    path: 'companies',
    loadChildren: () => import('./pages/company-list-page/company-list-page.module').then((module: any) => module.CompanyListPageModule)
  },
  {
    path: 'authors',
    loadChildren: () => import('./pages/author-list-page/author-list-page.module').then((module: any) => module.AuthorListPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentOverviewRoutingModule { }
