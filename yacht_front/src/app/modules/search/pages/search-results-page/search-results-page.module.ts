import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchResultsPageRoutingModule } from './search-results-page-routing.module';
import { SearchResultsPageComponent } from './search-results-page.component';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { FeedModule } from '@shared/modules/feed/feed.module';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [SearchResultsPageComponent],
  imports: [
    CommonModule,
    SearchResultsPageRoutingModule,
    SharedComponentsModule,
    FeedModule,
    SharedUiModule,
    TranslateModule.forChild()
  ]
})
export class SearchResultsPageModule { }
