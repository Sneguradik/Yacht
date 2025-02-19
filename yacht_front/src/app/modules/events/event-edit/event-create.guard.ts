import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventsService } from '@api/routes/events.service';

@Injectable({
  providedIn: 'root',
})
export class EventCreateGuard implements CanActivate {
  constructor(
    private readonly eventsService: EventsService,
    private readonly router: Router
  ) {}

  canActivate(): Observable<UrlTree> {
    return this.eventsService.create$().pipe(map((id: number) => this.router.createUrlTree(['/events', id, 'edit'])));
  }
}
