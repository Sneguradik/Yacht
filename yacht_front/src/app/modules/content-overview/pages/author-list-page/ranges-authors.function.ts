import { IToggleItem } from '@shared/interfaces/toggle-item.interface';
import { IUserQuery } from '@api/schemas/user/user-query.interface';
import { UserOrderEnum } from '@api/schemas/user/user-order.enum';
import { LocaleEnum } from '@api/schemas/locale/locale.enum';
import { TranslateService } from '@ngx-translate/core';

export function rangesAuthors(translateService: TranslateService): IToggleItem<never, IUserQuery>[] {
    return [
        {
            id: 10,
            text: translateService.instant('COMMON.SORT_BY_POPULARITY_DAY'),
            query: () => ({
                order: UserOrderEnum.RATING,
                'rating-after': Date.now() - 1000 * 60 * 60 * 24,
            }),
        },
        {
            id: 6,
            text: translateService.instant('COMMON.SORT_BY_POPULARITY_3_DAYS'),
            query: () => ({
                order: UserOrderEnum.RATING,
                'rating-after': Date.now() - 1000 * 60 * 60 * 24 * 3,
            }),
        },
        {
            id: 7,
            text: translateService.instant('COMMON.SORT_BY_POPULARITY_WEEK'),
            query: () => ({
                order: UserOrderEnum.RATING,
                'rating-after': Date.now() - 1000 * 60 * 60 * 24 * 7,
            }),
        },
        {
            id: 8,
            text: translateService.instant('COMMON.SORT_BY_POPULARITY_MONTH'),
            query: () => ({
                order: UserOrderEnum.RATING,
                'rating-after': Date.now() - 1000 * 60 * 60 * 24 * 30,
            }),
        },
        {
            id: 9,
            text: translateService.instant('COMMON.SORT_BY_POPULARITY_YEAR'),
            query: () => ({
                order: UserOrderEnum.RATING,
                'rating-after': Date.now() - 1000 * 60 * 60 * 24 * 30 * 12,
            }),
        },
        {
            id: 0,
            text: translateService.instant('COMMON.SORT_BY_NUMBER_OF_SUNSCRIBERS'),
            query: { order: UserOrderEnum.SUB_COUNT },
        },
        {
            id: 1,
            text: translateService.instant('COMMON.SORT_BY_NUMBER_OF_PUBLICATIONS'),
            query: { order: UserOrderEnum.POST_COUNT },
        },
        {
            id: 2,
            text: translateService.instant('COMMON.FROM_A_TO_Z_'),
            query: { order: UserOrderEnum.NAME, locale: LocaleEnum.RUSSIAN, asc: true },
        },
        {
            id: 3,
            text: translateService.instant('COMMON.FROM_Z_TO_A_'),
            query: { order: UserOrderEnum.NAME, locale: LocaleEnum.RUSSIAN },
        },
        {
            id: 4,
            text: translateService.instant('COMMON.FROM_A_TO_Z'),
            query: { order: UserOrderEnum.NAME, locale: LocaleEnum.ENGLISH, asc: true },
        },
        {
            id: 5,
            text: translateService.instant('COMMON.FROM_Z_TO_A'),
            query: { order: UserOrderEnum.NAME, locale: LocaleEnum.ENGLISH },
        },
    ];
}
