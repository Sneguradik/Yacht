import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserDropdownService {
  private readonly showDropdown$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public getShowDropdown(): Observable<boolean> {
    return this.showDropdown$.asObservable();
  }

  public setShowDropdown(value: boolean): void {
    if (this.showDropdown$.value !== value) {
      this.showDropdown$.next(value);
    }
  }
}
