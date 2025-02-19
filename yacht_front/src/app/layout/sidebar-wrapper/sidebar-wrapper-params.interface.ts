import { IArticleViewFull } from '@api/schemas/article/article-view-full.interface';

export interface ISidebarWrapperParams {
    navigation?: boolean;
    trending?: boolean;
    article?: boolean;
    articleData?: IArticleViewFull;
    live?: boolean;
    showSidebar: boolean;
}
