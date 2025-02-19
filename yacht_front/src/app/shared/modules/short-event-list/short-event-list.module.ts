import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventsComponent } from './events.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedPipesModule } from '@shared/pipes/shared-pipes.module';

@NgModule({
  declarations: [EventsComponent],
  imports: [CommonModule, SharedPipesModule, RouterModule, TranslateModule.forChild()],
  exports: [EventsComponent, EventsComponent],
})
export class ShortEventListModule {}
