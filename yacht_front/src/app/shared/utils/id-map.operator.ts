import { OperatorFunction } from 'rxjs';
import { ParamMap } from '@angular/router';
import { map } from 'rxjs/operators';

export function idMap(): OperatorFunction<ParamMap, string | number> {
    return map((value: ParamMap) => {
        const id: string = value.get('id');
        return !/^\d+$/.test(id) ? id : parseInt(id, 10);
    });
}
