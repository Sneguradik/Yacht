import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AllEventsPageComponent } from './all-events-page.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: AllEventsPageComponent,
      },
    ]),
  ],
  exports: [RouterModule],
})
export class AllEventsRoutingModule {}
