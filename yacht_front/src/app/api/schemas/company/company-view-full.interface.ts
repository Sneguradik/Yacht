import { IUserViewFull } from '../user/user-view-full.interface';

export interface ICompanyViewFull extends IUserViewFull {
    jobCount: number;
    eventCount: number;
}
