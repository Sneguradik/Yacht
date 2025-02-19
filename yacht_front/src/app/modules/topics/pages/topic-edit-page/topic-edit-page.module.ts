import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TopicEditPageRoutingModule } from './topic-edit-page-routing.module';
import { TopicEditPageComponent } from './topic-edit-page.component';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { SvgModule } from '@shared/modules/svg/svg.module';
import { TranslateModule } from '@ngx-translate/core';
import { AutosizeModule } from 'ngx-autosize';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [TopicEditPageComponent],
  imports: [
    CommonModule,
    TopicEditPageRoutingModule,
    SharedUiModule,
    SharedComponentsModule,
    SvgModule,
    TranslateModule.forChild(),
    AutosizeModule,
    ReactiveFormsModule
  ]
})
export class TopicEditPageModule { }
