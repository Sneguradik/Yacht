import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RecoveryRoutingModule } from './recovery-routing.module';
import { RecoveryComponent } from './recovery.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SharedUiModule } from '@shared/ui/shared-ui.module';

@NgModule({
  declarations: [RecoveryComponent],
  imports: [
    CommonModule,
    RecoveryRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
    SharedUiModule
  ],
})
export class RecoveryModule {}
