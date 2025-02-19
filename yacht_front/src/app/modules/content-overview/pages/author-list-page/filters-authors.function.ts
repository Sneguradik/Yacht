import { TranslateService } from '@ngx-translate/core';
import { IUserQuery } from '@api/schemas/user/user-query.interface';
import { IToggleItem } from '@shared/interfaces/toggle-item.interface';
import { UserOrderEnum } from '@api/schemas/user/user-order.enum';

export function filtersAuthors(translateService: TranslateService): IToggleItem<never, IUserQuery>[] {
    return [
        {
            id: 0,
            text: translateService.instant('COMMON.MY_SUBSCRIPTIONS'),
            query: { sub: true, order: UserOrderEnum.LAST_POST_TIME },
        },
        {
            id: 1,
            text: translateService.instant('COMMON.RECOMMENDED'),
            query: { order: UserOrderEnum.RATING, 'rating-after': Date.now() - 1000 * 60 * 60 * 24 * 7 },
        },
        {
            id: 2,
            text: translateService.instant('COMMON.RECENT'),
            query: { order: UserOrderEnum.LAST_POST_TIME },
        }
    ];
}
