import { ReplaySubject } from 'rxjs';

export interface IUserDropdownData {
    topics: number;
    authors: number;
    posts: number;
    companies: number;
    comments: number;
    readonly drafts$: ReplaySubject<number>;
    publications: number;
    readonly promoted$: ReplaySubject<number>;
}
