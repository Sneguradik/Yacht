import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TopicListPageRoutingModule } from './topic-list-page-routing.module';
import { TopicListPageComponent } from './topic-list-page.component';
import { TopicViewComponent } from './topic-view/topic-view.component';
import { SharedPipesModule } from '@shared/pipes/shared-pipes.module';
import { CommonDirectivesModule } from '@shared/directives/directives.module';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { NavbarModule } from '@modules/content-overview/navbar/navbar.module';
import { SvgModule } from '@shared/modules/svg/svg.module';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FiltersModule } from '@shared/modules/filters/filters.module';
import { RangesModule } from '@shared/modules/ranges/ranges.module';
import { SharedComponentsModule } from '@shared/components/shared-components.module';


@NgModule({
  declarations: [TopicListPageComponent, TopicViewComponent],
  imports: [
    CommonModule,
    TopicListPageRoutingModule,
    SharedPipesModule,
    CommonDirectivesModule,
    SharedUiModule,
    NavbarModule,
    SvgModule,
    RouterModule,
    TranslateModule.forChild(),
    FiltersModule,
    RangesModule,
    SharedComponentsModule
  ]
})
export class TopicListPageModule { }
