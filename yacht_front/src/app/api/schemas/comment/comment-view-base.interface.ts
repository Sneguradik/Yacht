import { IObject } from '../object/object.interface';
import { IUserViewBase } from '../user/user-view-base.interface';

export interface ICommentViewBase extends IObject {
    owner: IUserViewBase;
    html: string;
    watch?: boolean;
}
