import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'edit',
    loadChildren: () => import('./pages/topic-edit-page/topic-edit-page.module').then((module: any) => module.TopicEditPageModule)
  },
  {
    path: '',
    loadChildren: () => import('./pages/topic-page/topic-page.module').then((module: any) => module.TopicPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TopicsRoutingModule { }
