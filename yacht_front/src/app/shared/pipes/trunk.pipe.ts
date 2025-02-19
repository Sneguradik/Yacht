import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trunk'
})
export class TrunkPipe implements PipeTransform {
  transform(value: string, length: number): string {
    let finalString: string = value;
    if (value?.length > length) {
      finalString = value.slice(0, length) + '...';
    }
    return finalString;
  }
}
