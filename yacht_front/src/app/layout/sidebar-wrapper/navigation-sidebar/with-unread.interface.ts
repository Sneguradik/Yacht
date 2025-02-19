import { Observable } from 'rxjs';

export interface IWithUnread {
    unread$: Observable<number>;
}
