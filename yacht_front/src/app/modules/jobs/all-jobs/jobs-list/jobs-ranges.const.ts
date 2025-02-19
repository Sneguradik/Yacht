import { TranslateService } from '@ngx-translate/core';
import { IToggleItem } from '@shared/interfaces/toggle-item.interface';
import { IJobQuery } from '@api/schemas/job/job-query.interface';
import { JobOrderEnum } from '@api/schemas/job/job-order.enum';

export const jobsRanges = (translateService: TranslateService): IToggleItem<never, IJobQuery>[] => {
    return [
        {
            id: 0,
            text: translateService.instant('COMMON.SORT_BY_NUMBER_OF_VIEWS'),
            query: { order: JobOrderEnum.VIEWS },
        },
        {
            id: 1,
            text: translateService.instant('COMMON.BY_ADDING_TO_BOOKMARKS'),
            query: { order: JobOrderEnum.BOOKMARKS },
        },
        {
            id: 2,
            text: translateService.instant('COMMON.SORT_BY_TIME_POSTED'),
            query: { order: JobOrderEnum.LAST_POST_TIME },
        }
    ];
};
