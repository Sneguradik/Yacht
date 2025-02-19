import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TopicEditPageComponent } from './topic-edit-page.component';

const routes: Routes = [
  {
    path: '',
    component: TopicEditPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TopicEditPageRoutingModule { }
