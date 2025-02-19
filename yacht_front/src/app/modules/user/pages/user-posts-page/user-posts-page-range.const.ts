import { FeedOrderEnum } from '@api/schemas/feed/feed-order.enum';
import { IFeedParams } from '@api/schemas/feed/feed-params.interface';
import { IToggleItem } from '@shared/interfaces/toggle-item.interface';
import { LocaleEnum } from '@api/schemas/locale/locale.enum';
import { TranslateService } from '@ngx-translate/core';

export function getUserPostsRanges(translateService: TranslateService): IToggleItem<never, IFeedParams>[] {
  return [
    {
      id: 10,
      text: translateService.instant('COMMON.SORT_BY_POPULARITY_DAY'),
      query: {
        order: FeedOrderEnum.RATING,
        'rating-after': Date.now() - 1000 * 60 * 60 * 24,
      },
    },
    {
      id: 6,
      text: translateService.instant('COMMON.SORT_BY_POPULARITY_3_DAYS'),
      query: {
        order: FeedOrderEnum.RATING,
        'rating-after': Date.now() - 1000 * 60 * 60 * 24 * 3,
      },
    },
    {
      id: 7,
      text: translateService.instant('COMMON.SORT_BY_POPULARITY_WEEK'),
      query: {
        order: FeedOrderEnum.RATING,
        'rating-after': Date.now() - 1000 * 60 * 60 * 24 * 7,
      },
    },
    {
      id: 8,
      text: translateService.instant('COMMON.SORT_BY_POPULARITY_MONTH'),
      query: {
        order: FeedOrderEnum.RATING,
        'rating-after': Date.now() - 1000 * 60 * 60 * 24 * 30,
      },
    },
    {
      id: 9,
      text: translateService.instant('COMMON.SORT_BY_POPULARITY_YEAR'),
      query: {
        order: FeedOrderEnum.RATING,
        'rating-after': Date.now() - 1000 * 60 * 60 * 24 * 30 * 12,
      },
    },
    {
      id: 1,
      text: translateService.instant('COMMON.THE_NEWEST_FIRST'),
      query: { order: FeedOrderEnum.TIME },
    },
    {
      id: 2,
      text: translateService.instant('COMMON.FROM_A_TO_Z_'),
      query: { order: FeedOrderEnum.TITLE, locale: LocaleEnum.RUSSIAN, asc: true },
    },
    {
      id: 3,
      text: translateService.instant('COMMON.FROM_Z_TO_A_'),
      query: { order: FeedOrderEnum.TITLE, locale: LocaleEnum.RUSSIAN },
    },
    {
      id: 4,
      text: translateService.instant('COMMON.FROM_A_TO_Z'),
      query: { order: FeedOrderEnum.TITLE, locale: LocaleEnum.ENGLISH, asc: true },
    },
    {
      id: 5,
      text: translateService.instant('COMMON.FROM_Z_TO_A'),
      query: { order: FeedOrderEnum.TITLE, locale: LocaleEnum.ENGLISH },
    },
  ];
}
