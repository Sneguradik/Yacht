import { IViewable } from '../base/viewable.interface';
import { IObject } from '../object/object.interface';
import { PublicationStageEnum } from '../article/publication-stage.enum';

export interface IShowcaseView extends IObject, IViewable {
    status: {
        publicationStage: PublicationStageEnum;
        publishedAt?: number;
    };
    info: {
        duration?: number;
        cover?: string;
        title: string;
        subtitle: string;
        url?: string;
        options?: {
            postCount?: number;
            subCount?: number;
            viewCount?: number;
        };
    };
}
