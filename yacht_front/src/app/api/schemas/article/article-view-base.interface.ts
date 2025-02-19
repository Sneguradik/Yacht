import { IObject } from '../object/object.interface';
import { PublicationStageEnum } from './publication-stage.enum';

export interface IArticleViewBase extends IObject {
    status: {
        publicationStage: PublicationStageEnum;
        publishedAt: number;
    };
    info: {
        title: string;
        summary: string;
        cover: string;
    };
    authorId: number;
}
