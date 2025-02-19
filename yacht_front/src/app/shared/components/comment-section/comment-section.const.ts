import { ICommentViewArticle } from '@api/schemas/comment/comment-view-article.interface';
import { ISortMode } from './sort-mode.const';
import { orderByScore } from './order-by-score.function';
import { orderByTime } from './order-by-time.interface';

export const SortModes: ISortMode[] = [
  {
    name: 'COMMON.POPULAR_FIRST',
    sort: (a: ICommentViewArticle, b: ICommentViewArticle) => {
      return orderByScore(a, b) || orderByTime(a, b);
    },
  },
  {
    name: 'COMMON.BY_ORDER',
    sort: (a: ICommentViewArticle, b: ICommentViewArticle) => {
      return orderByTime(a, b) || orderByScore(a, b);
    },
  },
];
