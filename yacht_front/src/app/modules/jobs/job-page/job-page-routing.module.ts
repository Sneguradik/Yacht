import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobPageUnwrapComponent } from './job-page-unwrap.component';
import { JobsResolverService } from '@shared/services/jobs-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: JobPageUnwrapComponent,
    resolve: { data: JobsResolverService }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JobPageRoutingModule {}
