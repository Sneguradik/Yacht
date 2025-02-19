export interface IActivityView {
    count: {
        all: number;
        users: number;
        companies: number;
    };
    registrations: {
        all: number;
        users: number;
        companies: number;
    };
    presence: {
        all: number;
        users: number;
        companies: number;
    };
    activity: {
        all: number;
        users: number;
        companies: number;
    };
    materials: {
        all: {
            articles: number;
            comments: number;
            news: number;
        };
        users: {
            articles: number;
            comments: number;
            news: number;
        };
        companies: {
            articles: number;
            comments: number;
            news: number;
        };
    };
}
