export interface IObject {
  meta: {
    id: number;
    createdAt: number;
    updatedAt: number;
    deletedAt?: number;
  };
}
