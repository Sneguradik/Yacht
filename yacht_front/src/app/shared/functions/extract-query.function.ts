import { IToggleItem } from '@shared/interfaces/toggle-item.interface';

export function extractQuery<T, Q>(item: IToggleItem<T, Q>): Q | {} {
    let result: Q | {};
    if (!item || !item.query) {
        result = {};
    } else if (item.query instanceof Function) {
        result = item.query();
    } else {
        result = item.query;
    }
    return result;
}
