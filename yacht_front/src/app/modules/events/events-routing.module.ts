import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventCreateGuard } from './event-edit/event-create.guard';
import { MasterGuard } from '@shared/guards/master.guard';
import { CompanyGuard, EditorGuard, SuperUserGuard } from '@shared/guards/guards';

const routes: Routes = [
  {
    path: 'create',
    loadChildren: () => import('./event-edit/event-edit.module').then((module: any) => module.EventEditModule),
    canActivate: [MasterGuard],
    data: { guards: [EventCreateGuard], guardsRelation: 'AND'},
  },
  {
    path: ':id/edit',
    loadChildren: () => import('./event-edit/event-edit.module').then((module: any) => module.EventEditModule),
    canActivate: [MasterGuard],
    data: { guards: [SuperUserGuard, EditorGuard, CompanyGuard], guardsRelation: 'OR', alternativeRoute: '/'},
  },
  {
    path: ':id',
    loadChildren: () => import('./event-page/event-page.module').then((module: any) => module.EventPageModule)
  },
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('./all-events/all-events.module').then((module: any) => module.AllEventsModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventsRoutingModule {}
