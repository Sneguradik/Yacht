import { Pipe, PipeTransform } from '@angular/core';
import { IUserViewBase } from '@api/schemas/user/user-view-base.interface';

@Pipe({
  name: 'accountUrl'
})
export class AccountUrlPipe implements PipeTransform {
  transform(value: IUserViewBase, sub?: string): any {
    const result: any[] = [value.info.company.isCompany ? '/company' : '/user', value.info.username ? value.info.username : value.meta.id];
    if (sub) {
      result.push(sub);
    }
    return result;
  }
}
