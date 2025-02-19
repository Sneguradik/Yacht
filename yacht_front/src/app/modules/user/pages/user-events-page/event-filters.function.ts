import { EventFiltersEnum } from '@api/schemas/event/event-filters.enum';
import { IToggleItem } from '@shared/interfaces/toggle-item.interface';
import { IEventQuery } from '@api/schemas/event/event-query.interface';
import { TranslateService } from '@ngx-translate/core';

export function eventFilters(translateService: TranslateService): IToggleItem<EventFiltersEnum, IEventQuery>[] {
    return [
        {
            id: 0,
            text: translateService.instant('COMMON.ALL'),
            data: null,
        },
        {
            id: 1,
            text: translateService.instant('COMMON.EXHIBITS'),
            data: EventFiltersEnum.EXHIBITIONS,
        },
        {
            id: 2,
            text: translateService.instant('COMMON.EDUCATION'),
            data: EventFiltersEnum.TRAINING,
        },
        {
            id: 3,
            text: translateService.instant('COMMON.REGATTA_'),
            data: EventFiltersEnum.REGATTAS,
        },
        {
            id: 4,
            text: translateService.instant('COMMON.FLEET'),
            data: EventFiltersEnum.FLOTILLAS,
        },
        {
            id: 5,
            text: translateService.instant('COMMON.PRESENTATIONS'),
            data: EventFiltersEnum.PRESENTATIONS,
        },
        {
            id: 6,
            text: translateService.instant('COMMON.PRESS-CONFERENCES'),
            data: EventFiltersEnum.CONFERENCES,
        },
        {
            id: 7,
            text: 'Конференции',
            data: EventFiltersEnum.FORUMS,
        },
        {
            id: 8,
            text: translateService.instant('COMMON.OTHER'),
            data: EventFiltersEnum.OTHER,
        },
    ];
}
