import { ISubscribable } from '../base/subscribable.interface';
import { ITopicViewBase } from './topic-view-base.interface';

export interface ITopicView extends ITopicViewBase, ISubscribable {
    postCount: number;
    hidden?: boolean;
}
