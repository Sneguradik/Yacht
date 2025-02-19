export class Glb {
  public static makeEnum<T extends { [index: string]: U }, U extends string | number>(x: T): T {
    return x;
  }
}
