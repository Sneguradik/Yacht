import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobEditComponent } from './job-edit.component';

const routes: Routes = [
  {
    path: '',
    component: JobEditComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JobEditRoutingModule {}
