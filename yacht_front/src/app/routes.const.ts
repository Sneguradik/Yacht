import { Routes } from '@angular/router';
import { SuperUserGuard, SalesGuard, RecoveryGuard, UserGuard } from '@shared/guards/guards';
import { MasterGuard } from '@shared/guards/master.guard';
import { BlockerGuard } from './blocker/blocker.guard';

export const BLOCKER_ROUTES: Routes = [
  {
    path: 'blocker',
    pathMatch: 'full',
    loadChildren: () => import('./blocker/blocker.module').then((module: any) => module.BlockerModule)
  },
  {
    path: '',
    canActivate: [BlockerGuard],
    children: [
      {
        path: '404',
        pathMatch: 'full',
        loadChildren: () => import('./modules/not-found/not-found.module').then((module: any) => module.NotFoundModule)
      },
      {
        path: '',
        loadChildren: () => import('./modules/homepage/homepage.module').then((module: any) => module.HomepageModule)
      },
      {
        path: '',
        loadChildren: () => import('./modules/content-overview/content-overview.module').then((module: any) => module.ContentOverviewModule)
      },
      {
        path: 'news',
        loadChildren: () => import('./modules/news/news.module').then((module: any) => module.NewsModule)
      },
      {
        path: 'tags',
        loadChildren: () => import('./modules/tags/tags.module').then((module: any) => module.TagsModule)
      },
      {
        path: 'events',
        loadChildren: () => import('./modules/events/events.module').then((module: any) => module.EventsModule)
      },
      {
        path: 'jobs',
        loadChildren: () => import('./modules/jobs/jobs.module').then((module: any) => module.JobsModule),
      },
      {
        path: 'search',
        loadChildren: () => import('./modules/search/search.module').then((module: any) => module.SearchModule),
      },
      {
        path: 'user/:id',
        loadChildren: () => import('./modules/user/user.module').then((module: any) => module.UserModule),
        canActivate: [MasterGuard],
        data: { guards: [UserGuard], guardsRelation: 'AND'},
      },
      {
        path: 'company/:id',
        loadChildren: () => import('./modules/user/user.module').then((module: any) => module.UserModule)
      },
      {
        path: 'topics/:id',
        loadChildren: () => import('./modules/topics/topics.module').then((module: any) => module.TopicsModule)
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./modules/dashboard/dashboard.module').then((module: any) => module.DashboardModule),
        canActivate: [MasterGuard],
        data: { guards: [SuperUserGuard, SalesGuard], guardsRelation: 'OR', alternativeRoute: '/all' },
      },
      {
        path: 'recovery',
        loadChildren: () => import('./modules/recovery/recovery.module').then((module: any) => module.RecoveryModule),
        canActivate: [MasterGuard],
        data: { guards: [RecoveryGuard], guardsRelation: 'AND'},
      },
      {
        path: '**',
        redirectTo: '404'
      }
    ]
  }
];

export const DEFAULT_ROUTES: Routes = [
  {
    path: '404',
    pathMatch: 'full',
    loadChildren: () => import('./modules/not-found/not-found.module').then((module: any) => module.NotFoundModule)
  },
  {
    path: '',
    loadChildren: () => import('./modules/homepage/homepage.module').then((module: any) => module.HomepageModule)
  },
  {
    path: '',
    loadChildren: () => import('./modules/content-overview/content-overview.module').then((module: any) => module.ContentOverviewModule)
  },
  {
    path: 'news',
    loadChildren: () => import('./modules/news/news.module').then((module: any) => module.NewsModule)
  },
  {
    path: 'tags',
    loadChildren: () => import('./modules/tags/tags.module').then((module: any) => module.TagsModule)
  },
  {
    path: 'events',
    loadChildren: () => import('./modules/events/events.module').then((module: any) => module.EventsModule)
  },
  {
    path: 'jobs',
    loadChildren: () => import('./modules/jobs/jobs.module').then((module: any) => module.JobsModule),
  },

  {
    path: 'search',
    loadChildren: () => import('./modules/search/search.module').then((module: any) => module.SearchModule),
  },
  {
    path: 'user/:id',
    loadChildren: () => import('./modules/user/user.module').then((module: any) => module.UserModule),
    canActivate: [MasterGuard],
    data: { guards: [UserGuard], guardsRelation: 'AND'},
  },
  {
    path: 'company/:id',
    loadChildren: () => import('./modules/user/user.module').then((module: any) => module.UserModule)
  },
  {
    path: 'topics/:id',
    loadChildren: () => import('./modules/topics/topics.module').then((module: any) => module.TopicsModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then((module: any) => module.DashboardModule),
    canActivate: [MasterGuard],
    data: { guards: [SuperUserGuard, SalesGuard], guardsRelation: 'OR', alternativeRoute: '/all' },
  },
  {
    path: 'recovery',
    loadChildren: () => import('./modules/recovery/recovery.module').then((module: any) => module.RecoveryModule),
    canActivate: [MasterGuard],
    data: { guards: [RecoveryGuard], guardsRelation: 'AND'},
  },
  {
    path: '**',
    redirectTo: '404'
  }
];
