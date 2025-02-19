import { ICommentViewArticle } from '@api/schemas/comment/comment-view-article.interface';

export function orderByScore(a: ICommentViewArticle, b: ICommentViewArticle): number {
    const as: number = a.meta.deletedAt ? -Infinity : a.votes.up - a.votes.down;
    const bs: number = b.meta.deletedAt ? -Infinity : b.votes.up - b.votes.down;
    if (as > bs) { return -1; }
    if (bs > as) { return 1; }
    return 0;
}
