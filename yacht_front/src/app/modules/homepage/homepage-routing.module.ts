import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MasterGuard } from '@shared/guards/master.guard';
import { PersonalFeedGuard } from '@shared/guards/guards';


const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/home-page/home-page.module').then((module: any) => module.HomePageModule),
    canActivate: [MasterGuard],
    data: { guards: [PersonalFeedGuard], guardsRelation: 'AND', alternativeRoute: '/all' },
  },
  {
    path: 'all',
    loadChildren: () => import('./pages/all-page/all-page.module').then((module: any) => module.AllPageModule)
  },
  {
    path: 'popular',
    loadChildren: () => import('./pages/popular-page/popular-page.module').then((module: any) => module.PopularPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomepageRoutingModule { }
