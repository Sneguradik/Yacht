import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MoreMenuComponent } from './more-menu.component';
import { MoreMenuWrapperComponent } from './more-menu-wrapper/more-menu-wrapper.component';
import { MoreMenuDirective } from './more-menu.directive';
import { SharedComponentsModule } from '@shared/components/shared-components.module';

@NgModule({
  declarations: [MoreMenuComponent, MoreMenuWrapperComponent, MoreMenuDirective],
  imports: [CommonModule, SharedComponentsModule],
  exports: [MoreMenuComponent, MoreMenuWrapperComponent, MoreMenuDirective],
})
export class MoreMenuModule {}
