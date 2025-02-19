import { AnyParamsType, ParamsType } from '@api/types/params.type';
import { HttpParams } from '@angular/common/http';

export function toAngularParams(input?: AnyParamsType): ParamsType {
    let result: ParamsType;
    if (!input || input instanceof HttpParams) {
        result = input;
    } else {
        result = {};
        Object.keys(input).forEach((key: string) => {
            const value: any = input[key];
            if (value !== undefined) {
                if (Array.isArray(value)) {
                    result[key] = value.map((it: any) => String(it));
                } else {
                    result[key] = String(value);
                }
            }
        });
    }
    return result;
}
