import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AutosizeModule } from 'ngx-autosize';
import { EventEditRoutingModule } from './event-edit-routing.module';
import { EventEditorComponent } from './event-editor.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { TranslateModule } from '@ngx-translate/core';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { SharedComponentsModule } from '@shared/components/shared-components.module';

@NgModule({
  declarations: [EventEditorComponent],
  imports: [
    CommonModule,
    EventEditRoutingModule,
    ReactiveFormsModule,
    SharedUiModule,
    SharedComponentsModule,
    AutosizeModule,
    NgScrollbarModule,
    TranslateModule.forChild(),
  ],
  exports: [EventEditorComponent],
})
export class EventEditModule {}
