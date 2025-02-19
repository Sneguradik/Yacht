import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TagPageRoutingModule } from './tag-page-routing.module';
import { TagPageComponent } from './tag-page.component';
import { TagHeaderComponent } from './tag-header/tag-header.component';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { TranslateModule } from '@ngx-translate/core';
import { FeedModule } from '@shared/modules/feed/feed.module';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { CommonDirectivesModule } from '@shared/directives/directives.module';


@NgModule({
  declarations: [TagPageComponent, TagHeaderComponent],
  imports: [
    CommonModule,
    TagPageRoutingModule,
    SharedUiModule,
    TranslateModule.forChild(),
    FeedModule,
    SharedComponentsModule,
    CommonDirectivesModule
  ]
})
export class TagPageModule { }
