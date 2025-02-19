import { IObject } from '@api/schemas/object/object.interface';

export function orderObjects<T extends IObject>(ids: number[]): (a: T, b: T) => number {
  return (a: T, b: T) => {
    const indexA = ids.indexOf(a.meta.id);
    const indexB = ids.indexOf(b.meta.id);
    let result = 0;
    if (indexA < indexB) {
      result = -1;
    } else if (indexA > indexB) {
      result = 1;
    }
    return result;
  };
}
