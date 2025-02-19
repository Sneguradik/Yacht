import { ICommentViewArticle } from '@api/schemas/comment/comment-view-article.interface';

export function orderByTime(a: ICommentViewArticle, b: ICommentViewArticle): number {
    if (a.meta.createdAt > b.meta.createdAt) { return 1; }
    if (b.meta.createdAt > a.meta.createdAt) { return -1; }
    return 0;
}
