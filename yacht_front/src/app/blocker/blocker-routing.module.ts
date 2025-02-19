import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BlockerComponent } from './blocker.component';

const routes: Routes = [
  {
    path: '',
    component: BlockerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlockerRoutingModule { }
