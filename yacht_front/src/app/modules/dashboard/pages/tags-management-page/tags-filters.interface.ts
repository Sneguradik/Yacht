import { TranslateService } from '@ngx-translate/core';
import { ISelectItem } from '@modules/dashboard/shared/ui/dashboard-select/select-item.interface';

export const tagsFilters = (translateService: TranslateService): ISelectItem[] => {
    return [
        {
            title: 'По количеству за 30 дней',
            id: 0,
            payload: 'order=Frequency&after=' + (Date.now() - 1000 * 60 * 60 * 24 * 30),
        },
        {
            title: 'По количеству за 90 дней',
            id: 1,
            payload: 'order=Frequency&after=' + (Date.now() - 1000 * 60 * 60 * 24 * 90),
        },
        {
            title: translateService.instant('COMMON.FOR_THE_WHOLE_TIME'),
            id: 2,
            payload: 'order=Frequency',
        },
        {
            title: translateService.instant('COMMON.FROM_A_TO_Z_'),
            id: 3,
            payload: 'order=name&asc=true&locale=RUSSIAN',
        },
        {
            title: translateService.instant('COMMON.FROM_Z_TO_A_'),
            id: 4,
            payload: 'order=name&locale=RUSSIAN',
        },
        {
            title: translateService.instant('COMMON.FROM_A_TO_Z'),
            id: 5,
            payload: 'order=name&asc=true&locale=ENGLISH',
        },
        {
            title: translateService.instant('COMMON.FROM_Z_TO_A'),
            id: 6,
            payload: 'order=name&locale=ENGLISH',
        },
    ];
};
