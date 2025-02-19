import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { SuperUserGuard } from '@shared/guards/guards';
import { MasterGuard } from '@shared/guards/master.guard';

const alternativeRoute = '/dashboard/ads';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'ratings',
      },
      {
        path: 'activity',
        pathMatch: 'full',
        loadChildren: () => import('./pages/activity-management-page/activity-management-page.module')
          .then((module: any) => module.ActivityManagementPageModule),
        canActivate: [MasterGuard],
        data: { guards: [SuperUserGuard], guardsRelation: 'AND', alternativeRoute },
      },
      {
        path: 'ads',
        pathMatch: 'full',
        loadChildren: () => import('./pages/ads-management-page/ads-management-page.module')
          .then((module: any) => module.AdsManagementPageModule)
      },
      {
        path: 'events-jobs',
        pathMatch: 'full',
        loadChildren: () => import('./pages/events-jobs-management-page/events-jobs-management-page.module')
          .then((module: any) => module.EventsJobsManagementPageModule),
        canActivate: [MasterGuard],
        data: { guards: [SuperUserGuard], guardsRelation: 'AND', alternativeRoute },
      },
      {
        path: 'ratings',
        pathMatch: 'full',
        loadChildren: () => import('./pages/ratings-management-page/ratings-management-page.module')
          .then((module: any) => module.RatingsManagementPageModule),
        canActivate: [MasterGuard],
        data: { guards: [SuperUserGuard], guardsRelation: 'AND', alternativeRoute },
      },
      {
        path: 'roles',
        pathMatch: 'full',
        loadChildren: () => import('./pages/roles-management-page/roles-management-page.module')
          .then((module: any) => module.RolesManagementPageModule),
        canActivate: [MasterGuard],
        data: { guards: [SuperUserGuard], guardsRelation: 'AND', alternativeRoute },
      },
      {
        path: 'tags',
        pathMatch: 'full',
        loadChildren: () => import('./pages/tags-management-page/tags-management-page.module')
          .then((module: any) => module.TagsManagementPageModule),
        canActivate: [MasterGuard],
        data: { guards: [SuperUserGuard], guardsRelation: 'AND', alternativeRoute },
      },
      {
        path: 'topics',
        pathMatch: 'full',
        loadChildren: () => import('./pages/topics-management-page/topics-management-page.module')
          .then((module: any) => module.TopicsManagementPageModule),
        canActivate: [MasterGuard],
        data: { guards: [SuperUserGuard], guardsRelation: 'AND', alternativeRoute },
      },
      {
        path: 'preview',
        pathMatch: 'full',
        loadChildren: () => import('./pages/preview-management-page/preview-management-page.module')
          .then((module: any) => module.PreviewManagementPageModule),
        canActivate: [MasterGuard],
        data: { guards: [SuperUserGuard], guardsRelation: 'AND', alternativeRoute },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
