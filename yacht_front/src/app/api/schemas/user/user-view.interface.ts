import { IUserViewBase } from './user-view-base.interface';
import { ISubscribable } from '../base/subscribable.interface';

export interface IUserView extends IUserViewBase, ISubscribable {
    rating: number;
    postCount: number;
    hidden?: boolean;
    banned?: boolean;
}
