import { IUserView } from '../user/user-view.interface';

export interface ICompanyView extends IUserView {
    jobCount: number;
    eventCount: number;
}
