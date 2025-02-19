import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MasterGuard } from '@shared/guards/master.guard';
import { CompanyGuard, EditorGuard, JobCreateGuard, SuperUserGuard } from '@shared/guards/guards';

const routes: Routes = [
  {
    path: 'create',
    loadChildren: () => import('./job-edit/job-edit.module').then((module: any) => module.JobEditModule),
    canActivate: [MasterGuard],
    data: { guards: [JobCreateGuard], guardsRelation: 'AND'},
  },
  {
    path: ':id/edit',
    loadChildren: () => import('./job-edit/job-edit.module').then((module: any) => module.JobEditModule),
    canActivate: [MasterGuard],
    data: { guards: [SuperUserGuard, EditorGuard, CompanyGuard], guardsRelation: 'OR', alternativeRoute: '/'},
  },
  {
    path: ':id',
    loadChildren: () => import('./job-page/job-page.module').then((module: any) => module.JobPageModule),
  },
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('./all-jobs/all-jobs.module').then((module: any) => module.AllJobsModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JobsRoutingModule {}
