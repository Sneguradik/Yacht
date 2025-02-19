import { TranslateService } from '@ngx-translate/core';
import { IToggleItem } from '@shared/interfaces/toggle-item.interface';
import { ITopicQuery } from '@api/schemas/topic/topic-query.interface';
import { FilterEnum } from '@shared/enums/filter.enum';
import { TopicOrderEnum } from '@api/schemas/topic/topic-order.enum.interface';

export function filtersTopics(translateService: TranslateService): IToggleItem<FilterEnum, ITopicQuery>[] {
    return [
        {
            id: 0,
            text: translateService.instant('COMMON.MY_SUBSCRIPTIONS'),
            query: { sub: true, order: TopicOrderEnum.LAST_POST_TIME },
        },
        {
            id: 1,
            text: translateService.instant('COMMON.RECOMMENDED'),
            query: { order: TopicOrderEnum.RATING, 'rating-after': Date.now() - 1000 * 60 * 60 * 24 * 7 },
        },
        {
            id: 2,
            text: translateService.instant('COMMON.RECENT'),
            query: { order: TopicOrderEnum.LAST_POST_TIME },
        }
    ];
}
