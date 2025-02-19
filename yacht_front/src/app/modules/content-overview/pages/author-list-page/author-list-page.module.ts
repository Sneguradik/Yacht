import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthorListPageRoutingModule } from './author-list-page-routing.module';
import { AuthorListPageComponent } from './author-list-page.component';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { SharedPipesModule } from '@shared/pipes/shared-pipes.module';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { SvgModule } from '@shared/modules/svg/svg.module';
import { RangesModule } from '@shared/modules/ranges/ranges.module';
import { NavbarModule } from '@modules/content-overview/navbar/navbar.module';
import { TranslateModule } from '@ngx-translate/core';
import { UserViewModule } from '@shared/modules/user-view/user-view.module';
import { FiltersModule } from '@shared/modules/filters/filters.module';


@NgModule({
  declarations: [AuthorListPageComponent],
  imports: [
    CommonModule,
    AuthorListPageRoutingModule,
    SharedUiModule,
    SharedPipesModule,
    SharedComponentsModule,
    SvgModule,
    RangesModule,
    NavbarModule,
    TranslateModule.forChild(),
    UserViewModule,
    FiltersModule
  ]
})
export class AuthorListPageModule { }
