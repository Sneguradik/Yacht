import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EventsJobsManagementPageComponent } from './events-jobs-management-page.component';

const routes: Routes = [
  {
    path: '',
    component: EventsJobsManagementPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventsJobsManagementPageRoutingModule {}
