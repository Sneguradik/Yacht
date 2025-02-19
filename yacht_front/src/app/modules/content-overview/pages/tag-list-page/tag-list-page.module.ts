import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TagListPageRoutingModule } from './tag-list-page-routing.module';
import { TagListPageComponent } from './tag-list-page.component';
import { NavbarModule } from '@modules/content-overview/navbar/navbar.module';
import { TranslateModule } from '@ngx-translate/core';
import { CommonDirectivesModule } from '@shared/directives/directives.module';
import { RouterModule } from '@angular/router';
import { SvgModule } from '@shared/modules/svg/svg.module';


@NgModule({
  declarations: [TagListPageComponent],
  imports: [
    CommonModule,
    TagListPageRoutingModule,
    NavbarModule,
    TranslateModule.forChild(),
    CommonDirectivesModule,
    RouterModule,
    SvgModule
  ]
})
export class TagListPageModule { }
