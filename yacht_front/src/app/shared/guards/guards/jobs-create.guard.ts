import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JobsService } from '@api/routes/jobs.service';

@Injectable({
  providedIn: 'root',
})
export class JobCreateGuard implements CanActivate {
  constructor(private readonly jobsService: JobsService, private readonly router: Router) {}

  canActivate(): Observable<UrlTree> {
    return this.jobsService.create$().pipe(map((id: number) => this.router.createUrlTree(['/jobs', id, 'edit'])));
  }
}
