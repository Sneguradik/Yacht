import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { IEventViewFull } from '@api/schemas/event/event-view-full.interface';
import { EventsService } from '@api/routes/events.service';
import { Observable } from 'rxjs';
import { notFound } from '@shared/utils/not-found.operator';

@Injectable({
  providedIn: 'root'
})
export class EventsResolverService implements Resolve<IEventViewFull> {
  constructor(
    private readonly eventsService: EventsService,
    private readonly router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<IEventViewFull> {
    return this.eventsService.getSingle$(+route.params.id).pipe(notFound(this.router));
  }
}
