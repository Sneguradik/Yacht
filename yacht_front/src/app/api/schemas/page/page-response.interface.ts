export interface IPageResponse<T> {
    page: number;
    total: number;
    totalPages: number;
    content: T[];
}
