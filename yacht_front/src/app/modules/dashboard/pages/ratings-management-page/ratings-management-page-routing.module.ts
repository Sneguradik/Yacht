import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RatingsManagementPageComponent } from './ratings-management-page.component';

const routes: Routes = [
  {
    path: '',
    component: RatingsManagementPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RatingsManagementPageRoutingModule {}
