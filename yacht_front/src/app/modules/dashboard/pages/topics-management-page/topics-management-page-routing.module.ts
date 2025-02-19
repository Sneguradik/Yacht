import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TopicsManagementPageComponent } from './topics-management-page.component';

const routes: Routes = [
  {
    path: '',
    component: TopicsManagementPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TopicsManagementPageRoutingModule {}
