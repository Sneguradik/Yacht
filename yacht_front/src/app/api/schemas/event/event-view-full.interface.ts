import { IEventView } from './event-view.interface';

export interface IEventViewFull extends IEventView {
    body: {
        source: string;
        html: string | null;
        address: string | null;
        registrationLink: string | null;
    };
}
