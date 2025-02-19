import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: 'edit',
    loadChildren: () => import('./pages/user-edit-page/user-edit-page.module').then((module: any) => module.UserEditPageModule)
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'posts',
  },
  {
    path: 'posts',
    loadChildren: () => import('./pages/user-posts-page/user-posts-page.module').then((module: any) => module.UserPostsPageModule)
  },
  {
    path: 'comments',
    loadChildren: () => import('./pages/user-comments-page/user-comments-page.module').then((module: any) => module.UserCommentsPageModule)
  },
  {
    path: 'drafts',
    loadChildren: () => import('./pages/user-drafts-page/user-drafts-page.module').then((module: any) => module.UserDraftsPageModule)
  },
  {
    path: 'promoted',
    loadChildren: () => import('./pages/user-promoted-page/user-promoted-page.module').then((module: any) => module.UserPromotedPageModule)
  },
  {
    path: 'info',
    loadChildren: () => import('./pages/user-info-page/user-info-page.module').then((module: any) => module.UserInfoPageModule)
  },
  {
    path: 'notifications',
    loadChildren: () => import('./pages/user-notifications-page/user-notifications-page.module')
      .then((module: any) => module.UserNotificationsPageModule)
  },
  {
    path: 'events',
    loadChildren: () => import('./pages/user-events-page/user-events-page.module').then((module: any) => module.UserEventsPageModule)
  },
  {
    path: 'jobs',
    loadChildren: () => import('./pages/user-jobs-page/user-jobs-page.module').then((module: any) => module.UserJobsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
