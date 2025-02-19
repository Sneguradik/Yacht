import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompanyListPageRoutingModule } from './company-list-page-routing.module';
import { CompanyListPageComponent } from './company-list-page.component';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { SharedPipesModule } from '@shared/pipes/shared-pipes.module';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { SvgModule } from '@shared/modules/svg/svg.module';
import { FiltersModule } from '@shared/modules/filters/filters.module';
import { RangesModule } from '@shared/modules/ranges/ranges.module';
import { NavbarModule } from '@modules/content-overview/navbar/navbar.module';
import { TranslateModule } from '@ngx-translate/core';
import { UserViewModule } from '@shared/modules/user-view/user-view.module';


@NgModule({
  declarations: [CompanyListPageComponent],
  imports: [
    CommonModule,
    CompanyListPageRoutingModule,
    SharedUiModule,
    SharedPipesModule,
    SharedComponentsModule,
    SvgModule,
    FiltersModule,
    RangesModule,
    NavbarModule,
    TranslateModule.forChild(),
    UserViewModule
  ]
})
export class CompanyListPageModule { }
