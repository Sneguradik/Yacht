import { IArticleView } from '@api/schemas/article/article-view.interface';

export interface IArticleWithTopic extends IArticleView {
    topic: string;
}
