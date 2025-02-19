import { ISubscribable } from '@api/schemas/base/subscribable.interface';
import { IObject } from '@api/schemas/object/object.interface';

export type UiSubscribableViewItem = ISubscribable & IObject & {
    info: {
        name: string;
        picture: string;
    };
};
