import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { IJobViewFull } from '@api/schemas/job/job-view-full.interface';
import { JobsService } from '@api/routes/jobs.service';
import { Observable } from 'rxjs';
import { notFound } from '@shared/utils/not-found.operator';

@Injectable({
  providedIn: 'root'
})
export class JobsResolverService implements Resolve<IJobViewFull> {
  constructor(
    private readonly jobsService: JobsService,
    private readonly router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<IJobViewFull> {
    return this.jobsService.getSingle$(+route.params.id).pipe(notFound(this.router));
  }
}
