import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonNamePipe } from './person-name.pipe';
import { AccountUrlPipe } from './account-url.pipe';
import { CustomDatePipe } from './custom-date.pipe';
import { CallPipe } from './call.pipe';
import { TrunkPipe } from './trunk.pipe';
import { PersonNameShortPipe } from './person-name-short.pipe';
import { UrlPipe } from './url.pipe';
import { UnsafeUrlPipe } from './unsafe-url.pipe';
import { BigNumbersPipe } from './big-numbers.pipes';
import { TimeFunctions } from '@shared/functions/time.function';



@NgModule({
  declarations: [
    PersonNamePipe,
    AccountUrlPipe,
    CustomDatePipe,
    CallPipe,
    TrunkPipe,
    PersonNameShortPipe,
    UrlPipe,
    UnsafeUrlPipe,
    UnsafeUrlPipe,
    BigNumbersPipe
  ],
  exports: [
    PersonNamePipe,
    AccountUrlPipe,
    CustomDatePipe,
    CallPipe,
    TrunkPipe,
    PersonNameShortPipe,
    UrlPipe,
    UnsafeUrlPipe,
    BigNumbersPipe
  ],
  imports: [
    CommonModule
  ],
  providers: [TimeFunctions]
})
export class SharedPipesModule { }
