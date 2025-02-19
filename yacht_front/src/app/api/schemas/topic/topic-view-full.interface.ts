import { ITopicView } from './topic-view.interface';

export interface ITopicViewFull extends ITopicView {
    profile: {
        cover: string;
        fullDescription?: string;
    };
}
