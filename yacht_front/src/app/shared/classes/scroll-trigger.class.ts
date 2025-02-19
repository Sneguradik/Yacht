import { Subject, fromEvent } from 'rxjs';

export class ScrollTrigger {
    public readonly scroll$: Subject<never> = new Subject<never>();

    constructor(private threshold: number = 50) {
        this.initScrollTrigger();
    }

    private initScrollTrigger(): void {
        fromEvent(window, 'scroll').subscribe(() => this.scrollHandler());
    }

    private scrollHandler(): void {
        if (document.body.scrollHeight - window.innerHeight - window.pageYOffset <= this.threshold) {
            this.scroll$.next();
        }
    }
}
