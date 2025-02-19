import { FilterEnum } from '@shared/enums/filter.enum';
import { RangeEnum } from '@shared/enums/range.enum';
import { EventFilterEnum } from '@shared/enums/event-filter.enum';
import { ECommentsRange } from '@shared/enums/comments-range.enum';

export interface IToggleItem<T = FilterEnum | RangeEnum | EventFilterEnum | ECommentsRange, Q extends {} = {}> {
    id: number;
    text: string;
    data?: T;
    query?: Q | (() => Q);
    payload?: string;
}
