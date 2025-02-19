import { IArticleView } from '@api/schemas/article/article-view.interface';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';

export class PopularFeedItem {
    constructor(
        public readonly articleView: [IArticleView, ITopicView] = null,
        public readonly range: {
            before: number;
            after: number;
        } = null,
        public readonly empty: boolean = null,
        public readonly realIndex: number = -1,
    ) {}

    public isArticle(): boolean {
        return this.articleView !== null;
    }

    public isRange(): boolean {
        return this.range !== null;
    }

    public isEmpty(): boolean {
        return this.empty;
    }
}
