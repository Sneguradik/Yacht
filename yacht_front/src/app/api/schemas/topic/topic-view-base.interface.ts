import { IObject } from '../object/object.interface';

export interface ITopicViewBase extends IObject {
    info: {
        name: string;
        picture: string;
        description: string;
        url?: string;
    };
}
