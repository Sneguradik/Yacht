import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icon/icon.component';
import { ExpandBoxComponent } from './expand-box/expand-box.component';
import { RouterModule } from '@angular/router';
import { SharedPipesModule } from '@shared/pipes/shared-pipes.module';
import { SubscribableViewItemComponent } from './subscribable-view-item/subscribable-view-item.component';
import { CardComponent } from './card/card.component';
import { FormControlComponent } from './form-control/form-control.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { DropdownMenuComponent } from './dropdown-menu/dropdown-menu.component';
import { DropdownMenuItemComponent } from './dropdown-menu/dropdown-menu-item/dropdown-menu-item.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { TextareaComponent } from './textarea/textarea.component';
import { SvgModule } from '@shared/modules/svg/svg.module';
import { IconInputComponent } from './icon-input/icon-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiInput } from './input/ui-input.directive';
import { UiLabelComponent } from './label/label.component';
import { UiButtonComponent } from './button/button.component';
import { DotsMenuComponent } from './dots-menu/dots-menu.component';
import { DotsMenuItemComponent } from './dots-menu/dots-menu-item/dots-menu-item.component';
import { AutosizeModule } from 'ngx-autosize';
import { SearchComponent } from './search/search.component';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    IconComponent,
    ExpandBoxComponent,
    SubscribableViewItemComponent,
    CardComponent,
    FormControlComponent,
    IconInputComponent,
    CheckboxComponent,
    DropdownMenuComponent,
    DropdownMenuItemComponent,
    TextareaComponent,
    UiLabelComponent,
    UiInput,
    UiLabelComponent,
    UiButtonComponent,
    DotsMenuComponent,
    DotsMenuItemComponent,
    SearchComponent
  ],
  exports: [
    IconComponent,
    UiLabelComponent,
    IconInputComponent,
    ExpandBoxComponent,
    SubscribableViewItemComponent,
    CardComponent,
    FormControlComponent,
    CheckboxComponent,
    DropdownMenuComponent,
    DropdownMenuItemComponent,
    TextareaComponent,
    UiInput,
    UiLabelComponent,
    UiButtonComponent,
    DotsMenuComponent,
    DotsMenuItemComponent,
    SearchComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedPipesModule,
    NgScrollbarModule,
    SvgModule,
    FormsModule,
    ReactiveFormsModule,
    AutosizeModule,
    TranslateModule.forChild()
  ]
})
export class SharedUiModule { }
