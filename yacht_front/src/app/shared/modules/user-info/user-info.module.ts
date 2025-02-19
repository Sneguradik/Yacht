import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedPipesModule } from '@shared/pipes/shared-pipes.module';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { UserInfoComponent } from './user-info.component';



@NgModule({
  declarations: [UserInfoComponent],
  imports: [CommonModule, SharedPipesModule, RouterModule, SharedUiModule],
  exports: [UserInfoComponent],
})
export class UserInfoModule {}
