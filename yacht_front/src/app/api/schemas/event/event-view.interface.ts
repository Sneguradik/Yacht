import { IObject } from '../object/object.interface';
import { IBookmarkable } from '../base/bookmarkable.interface';
import { IViewable } from '../base/viewable.interface';
import { IUserViewBase } from '../user/user-view-base.interface';
import { PublicationStageEnum } from '../article/publication-stage.enum';

export interface IEventView extends IObject, IBookmarkable, IViewable {
    info: {
        publicationStage: PublicationStageEnum;
        publishedAt?: number;
        name: string;
        type?: any;
        date?: number;
        price?: string;
        currency: any;
        city?: string;
        announcement: string;
    };
    company: IUserViewBase;
    hidden?: boolean;
}
