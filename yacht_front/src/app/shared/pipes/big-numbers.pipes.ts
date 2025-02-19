import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bigNumbers',
})
export class BigNumbersPipe implements PipeTransform {
  transform(value: number): any {
    // tslint:disable-next-line:no-bitwise
    return value > 999 ? (value > 999999 ? ((value / 1000000) >> 0) + ' M' : ((value / 1000) >> 0) + ' К') : value;
  }
}
