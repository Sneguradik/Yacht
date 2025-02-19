import { TranslateService } from '@ngx-translate/core';
import { ISelectItem } from '@modules/dashboard/shared/ui/dashboard-select/select-item.interface';

export const rolesFilters = (translateService: TranslateService): ISelectItem[] => {
    return [
        {
            title: translateService.instant('COMMON.BY_RATING'),
            id: 0,
            payload: 'order=rating',
        },
        {
            title: translateService.instant('COMMON.SORT_BY_NUMBER_OF_PUBLICATIONS'),
            id: 1,
            payload: 'order=post-count',
        },
        {
            title: translateService.instant('COMMON.SORT_BY_NUMBER_OF_SUNSCRIBERS'),
            id: 2,
            payload: 'order=sub-count',
        },
        {
            title: translateService.instant('COMMON.FROM_A_TO_Z_'),
            id: 3,
            payload: 'order=name&locale=RUSSIAN&asc=true',
        },
        {
            title: translateService.instant('COMMON.FROM_Z_TO_A_'),
            id: 4,
            payload: 'order=name&locale=RUSSIAN',
        },
        {
            title: translateService.instant('COMMON.FROM_A_TO_Z'),
            id: 5,
            payload: 'order=name&locale=ENGLISH&asc=true',
        },
        {
            title: translateService.instant('COMMON.FROM_Z_TO_A'),
            id: 6,
            payload: 'order=name&locale=ENGLISH',
        },
    ];
};
