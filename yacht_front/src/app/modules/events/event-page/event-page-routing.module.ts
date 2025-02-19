import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventPageUnwrapComponent } from './event-page-unwrap.component';
import { EventsResolverService } from '@shared/services/events-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: EventPageUnwrapComponent,
    resolve: { data: EventsResolverService }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventPageRoutingModule {}
