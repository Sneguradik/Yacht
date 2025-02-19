import { IUserViewBase } from '../user/user-view-base.interface';
import { IViewable } from '../base/viewable.interface';
import { IBookmarkable } from '../base/bookmarkable.interface';
import { IJobViewBase } from './job-view-base.interface';

export interface IJobView extends IJobViewBase, IViewable, IBookmarkable {
    company: IUserViewBase;
    hidden?: boolean;
}
