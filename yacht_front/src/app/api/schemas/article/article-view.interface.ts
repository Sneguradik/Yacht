import { IUserViewBase } from '../user/user-view-base.interface';
import { IVoteable } from '../base/voteable.interface';
import { IArticleViewBase } from './article-view-base.interface';
import { IBookmarkable } from '../base/bookmarkable.interface';
import { IViewable } from '../base/viewable.interface';

export interface IArticleView extends IArticleViewBase, IVoteable, IBookmarkable, IViewable {
    author: IUserViewBase;
    topics: number[];
    tags: number[];
    commentCount: number;
    hidden?: boolean;
    pinned?: boolean;
    promotions?: {
        default: boolean;
        list: string[];
    };
}
