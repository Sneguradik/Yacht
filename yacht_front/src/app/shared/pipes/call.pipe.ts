import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'call'
})
export class CallPipe implements PipeTransform {
  transform(value: any, handler: (value: any) => any, context?: any): any {
    return handler.call(context, value);
  }
}
