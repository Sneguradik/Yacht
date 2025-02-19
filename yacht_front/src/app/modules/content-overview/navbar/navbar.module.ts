import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar.component';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { SvgModule } from '@shared/modules/svg/svg.module';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonDirectivesModule } from '@shared/directives/directives.module';



@NgModule({
  declarations: [NavbarComponent],
  exports: [NavbarComponent],
  imports: [
    CommonModule,
    SharedUiModule,
    SvgModule,
    RouterModule,
    ReactiveFormsModule,
    CommonDirectivesModule
  ]
})
export class NavbarModule { }
