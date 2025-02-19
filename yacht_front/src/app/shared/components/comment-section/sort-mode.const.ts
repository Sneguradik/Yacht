import { ICommentViewArticle } from '@api/schemas/comment/comment-view-article.interface';

export interface ISortMode {
    name: string;
    sort: (a: ICommentViewArticle, b: ICommentViewArticle) => number;
}
