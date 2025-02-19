import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobsComponent } from './jobs.component';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { SharedPipesModule } from '@shared/pipes/shared-pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [JobsComponent],
  exports: [JobsComponent],
  imports: [
    CommonModule,
    SharedUiModule,
    SharedPipesModule,
    TranslateModule.forChild(),
    RouterModule
  ]
})
export class ShortJobListModule { }
