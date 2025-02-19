import { HttpParams } from '@angular/common/http';

export type AnyParamsType = HttpParams | { [param: string]: any | any[] };
export type ParamsType = HttpParams | { [param: string]: string | string[] };
