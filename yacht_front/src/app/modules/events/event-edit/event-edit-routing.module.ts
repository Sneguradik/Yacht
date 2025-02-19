import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventEditorComponent } from './event-editor.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: EventEditorComponent,
      },
    ]),
  ],
  exports: [RouterModule],
})
export class EventEditRoutingModule {}
