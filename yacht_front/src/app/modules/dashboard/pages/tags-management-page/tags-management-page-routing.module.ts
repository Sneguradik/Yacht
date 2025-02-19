import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TagsManagementPageComponent } from './tags-management-page.component';

const routes: Routes = [
  {
    path: '',
    component: TagsManagementPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TagsManagementPageRoutingModule {}
