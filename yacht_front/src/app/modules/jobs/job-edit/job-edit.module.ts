import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { JobEditComponent } from './job-edit.component';
import { AutosizeModule } from 'ngx-autosize';
import { TranslateModule } from '@ngx-translate/core';
import { JobEditRoutingModule } from './job-edit-routing.module';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { SharedComponentsModule } from '@shared/components/shared-components.module';

@NgModule({
  declarations: [JobEditComponent],
  imports: [
    CommonModule,
    JobEditRoutingModule,
    ReactiveFormsModule,
    SharedUiModule,
    SharedComponentsModule,
    AutosizeModule,
    TranslateModule.forChild()
  ],
  exports: [JobEditComponent],
})
export class JobEditModule {}
