import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BlockerRoutingModule } from './blocker-routing.module';
import { BlockerComponent } from '../blocker/blocker.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [BlockerComponent],
  imports: [
    CommonModule,
    BlockerRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class BlockerModule { }
