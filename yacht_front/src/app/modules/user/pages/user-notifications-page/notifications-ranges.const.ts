import { IToggleItem } from '@shared/interfaces/toggle-item.interface';

export const NOTIFICATIONS_RANGES: IToggleItem<never, { order: string }>[] = [
    {
        id: 0,
        text: 'COMMON.ALL',
        payload: 'EVERYTHING',
    },
    {
        id: 1,
        text: 'COMMON.UNREAD',
        payload: 'UNREAD',
    },
    {
        id: 2,
        text: 'COMMON.SYSTEM_NOTIFICATIONS',
        payload: 'SYSTEM_GROUP',
    },
    {
        id: 3,
        text: 'COMMON.COMMENTS',
        payload: 'COMMENTS_GROUP',
    },
    {
        id: 4,
        text: 'COMMON.PUBLICATIONS_',
        payload: 'PUBLICATIONS_GROUP',
    },
];
