import { Pipe, PipeTransform } from '@angular/core';
import { TimeFunctions } from '@shared/functions/time.function';

@Pipe({
  name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {
  constructor(private readonly timeFunctions: TimeFunctions) { }

  transform(value: number, range?: boolean, news?: boolean): string {
    let result: string;
    if (news) {
      result = this.timeFunctions.timestampToStringNews(value);
    } else if (!range) {
      result = this.timeFunctions.timestampToString(value);
    } else {
      result = this.timeFunctions.timestampToStringRange(value);
    }
    return result;
  }
}
