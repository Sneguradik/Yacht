import { IObject } from '../object/object.interface';
import { ICommentViewArticle } from './comment-view-article.interface';
import { ICommentViewBase } from './comment-view-base.interface';

export interface ICommentViewFeed extends ICommentViewArticle {
    parent?: Omit<ICommentViewBase, 'text'>;
    context: { title: string } & IObject;
}
