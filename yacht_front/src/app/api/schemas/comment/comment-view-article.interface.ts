import { ICommentViewBase } from './comment-view-base.interface';
import { IVoteable } from '../base/voteable.interface';

export interface ICommentViewArticle extends ICommentViewBase, IVoteable {
  parent?: {
    meta: {
      id: number;
    };
  };
}
