import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TopicListPageComponent } from './topic-list-page.component';

const routes: Routes = [
  {
    path: '',
    component: TopicListPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TopicListPageRoutingModule { }
