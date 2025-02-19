import { TranslateService } from '@ngx-translate/core';
import { IToggleItem } from '@shared/interfaces/toggle-item.interface';
import { RangeEnum } from '@shared/enums/range.enum';
import { ITopicQuery } from '@api/schemas/topic/topic-query.interface';
import { TopicOrderEnum } from '@api/schemas/topic/topic-order.enum.interface';
import { LocaleEnum } from '@api/schemas/locale/locale.enum';

export function rangesTopics(translateService: TranslateService): IToggleItem<RangeEnum, ITopicQuery>[] {
    return [
        {
            id: 10,
            text: translateService.instant('COMMON.SORT_BY_POPULARITY_DAY'),
            query: () => ({
                order: TopicOrderEnum.RATING,
                'rating-after': Date.now() - 1000 * 60 * 60 * 24,
            }),
        },
        {
            id: 6,
            text: translateService.instant('COMMON.SORT_BY_POPULARITY_3_DAYS'),
            query: () => ({
                order: TopicOrderEnum.RATING,
                'rating-after': Date.now() - 1000 * 60 * 60 * 24 * 3,
            }),
        },
        {
            id: 7,
            text: translateService.instant('COMMON.SORT_BY_POPULARITY_WEEK'),
            query: () => ({
                order: TopicOrderEnum.RATING,
                'rating-after': Date.now() - 1000 * 60 * 60 * 24 * 7,
            }),
        },
        {
            id: 8,
            text: translateService.instant('COMMON.SORT_BY_POPULARITY_MONTH'),
            query: () => ({
                order: TopicOrderEnum.RATING,
                'rating-after': Date.now() - 1000 * 60 * 60 * 24 * 30,
            }),
        },
        {
            id: 9,
            text: translateService.instant('COMMON.SORT_BY_POPULARITY_YEAR'),
            query: () => ({
                order: TopicOrderEnum.RATING,
                'rating-after': Date.now() - 1000 * 60 * 60 * 24 * 30 * 12,
            }),
        },
        {
            id: 0,
            text: translateService.instant('COMMON.SORT_BY_NUMBER_OF_SUNSCRIBERS'),
            query: { order: TopicOrderEnum.SUB_COUNT },
        },
        {
            id: 1,
            text: translateService.instant('COMMON.SORT_BY_NUMBER_OF_PUBLICATIONS'),
            query: { order: TopicOrderEnum.POST_COUNT },
        },
        {
            id: 2,
            text: translateService.instant('COMMON.FROM_A_TO_Z_'),
            query: { order: TopicOrderEnum.NAME, locale: LocaleEnum.RUSSIAN, asc: true },
        },
        {
            id: 3,
            text: translateService.instant('COMMON.FROM_Z_TO_A_'),
            query: { order: TopicOrderEnum.NAME, locale: LocaleEnum.RUSSIAN },
        },
        {
            id: 4,
            text: translateService.instant('COMMON.FROM_A_TO_Z'),
            query: { order: TopicOrderEnum.NAME, locale: LocaleEnum.ENGLISH, asc: true },
        },
        {
            id: 5,
            text: translateService.instant('COMMON.FROM_Z_TO_A'),
            query: { order: TopicOrderEnum.NAME, locale: LocaleEnum.ENGLISH },
        }
    ];
}
