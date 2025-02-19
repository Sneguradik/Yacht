import { BehaviorSubject, Subscription } from 'rxjs';

export interface IMenuState {
    shown: BehaviorSubject<boolean> | boolean;
    sub: Subscription;
}
