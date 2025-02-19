export interface IEventsJobsControl {
    feed: {
        jobs: boolean;
        events: boolean;
    };
    publications: {
        jobs: boolean;
        events: boolean;
    };
    popular: {
        jobs: boolean;
        events: boolean;
    };
    publicationsBottom: boolean;
    firstView: {
        jobs: number;
        events: number;
    };
    secondView: {
        jobs: number;
        events: number;
    };
    thirdView: {
        jobs: number;
        events: number;
    };
}
