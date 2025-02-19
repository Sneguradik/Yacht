import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { from, Observable, of, ReplaySubject } from 'rxjs';
import { catchError, map, takeUntil, tap, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { JobTypeEnum } from '@api/schemas/job/job-type.enum';
import { IJobViewFull } from '@api/schemas/job/job-view-full.interface';
import { JobCurrencyEnum } from '@api/schemas/job/job-currency.enum';
import { JobPlaceEnum } from '@api/schemas/job/job-place.enum';
import { JobsService } from '@api/routes/jobs.service';
import { IJobPatch } from '@api/schemas/job/job-patch.inetrface';
import { IUploadImageResponse } from '@api/schemas/image/upload-image-response.interface';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';

@Component({
  selector: 'app-job-create',
  templateUrl: './job-edit.component.html',
  styleUrls: ['./job-edit.component.scss'],
})
export class JobEditComponent extends AbstractComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _jobId$: Observable<number>;

  public readonly CURRENCY: any = {
    [JobCurrencyEnum.RUB]: this.translateService.instant('COMMON.RUB'),
    [JobCurrencyEnum.USD]: this.translateService.instant('COMMON.USD'),
    [JobCurrencyEnum.EUR]: this.translateService.instant('COMMON.EUR'),
  };

  public readonly TYPE: any = {
    [JobTypeEnum.FULL]: this.translateService.instant('COMMON.FULL'),
    [JobTypeEnum.PART_TIME]: this.translateService.instant('COMMON.PARTIAL'),
  };

  public readonly PLACE: any = {
    [JobPlaceEnum.OFFICE]: this.translateService.instant('COMMON.PLACE.OFFICE'),
    [JobPlaceEnum.REMOTE]: this.translateService.instant('COMMON.PLACE.REMOTE'),
  };

  public uploadedImageName: string = null;
  public src: string = null;

  public readonly form: FormGroup = this.fb.group({
    info: this.fb.group({
      name: ['', [Validators.required]],
      minSalary: ['', [Validators.max(9999999), Validators.min(1)]],
      maxSalary: ['', [Validators.max(9999999), Validators.min(1)]],
      currency: [JobCurrencyEnum.RUB, Validators.required],
      type: ['', Validators.required],
      place: ['', Validators.required],
      city: [''],
      recruiterName: [''],
      email: ['', Validators.email],
    }),
    body: this.fb.group({
      tasks: [''],
      workConditions: [''],
      requirements: [''],
      image: [null],
    }),
  });

  public get jobId$(): Observable<number> {
    if (!this._jobId$) {
      const subject: ReplaySubject<number> = new ReplaySubject<number>(1);
      this._jobId$ = subject;

      this.route.paramMap.pipe(
        switchMap((params: ParamMap) => {
          const id: string = params.get('id');
          if (id && parseInt(id, 10)) {
            return of(+id);
          }
          return this.jobsService.create$();
        }),
        tap((id: number) => subject.next(id)),
        takeUntil(this.ngOnDestroy$)
      ).subscribe(
        (id: number) => subject.next(id),
        (err: any) => {
          subject.error(err);
          this._jobId$ = null;
        },
      );
    }
    return this._jobId$;
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly jobsService: JobsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly translateService: TranslateService,
    private readonly sidebarWrapperService: SidebarWrapperService
  ) {
    super();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: true, navigation: true, live: false, showSidebar: true });
    });

    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const id: number = parseInt(params.get('id'), 10);
        return (id && this.loadFrom$(id)) || of(null);
      }),
      takeUntil(this.ngOnDestroy$),
    ).subscribe();
  }

  private loadFrom$(jobId: number): Observable<void> {
    return this.jobsService.getSingle$(jobId).pipe(
      map((job: IJobViewFull) => {
        this.form.patchValue({
          ...job,
        });
        if (job.body.image) {
          this.uploadedImageName = 'Изображение загружено';
          this.src = job.body.image;
        }
      }),
      catchError(() => {
        return of(null);
      }),
    );
  }

  private sendPatch$(value: IJobViewFull): Observable<IJobViewFull> {
    return this.transformValue$(this.form.value, value).pipe(
      switchMap((patch: IJobPatch) => this.jobsService.patch$(value.meta.id, patch)),
      takeUntil(this.ngOnDestroy$)
    );
  }

  private transformValue$(value: any, val: IJobViewFull): Observable<IJobPatch> {
    const body: IJobPatch = { ...value.body, image: val.body.image };
    return of({
      ...value,
      info: {
        ...value.info,
        minSalary: value.info.minSalary ? String(value.info.minSalary) : null,
        maxSalary: value.info.maxSalary ? String(value.info.maxSalary) : null,
      },
      body,
    });
  }

  public handleUploadFile(event: any): void {
    const input: HTMLInputElement = event.target as HTMLInputElement;
    const file: File = input.files[0];

    if (file) {
      this.jobId$.pipe(
        switchMap((id: number) => this.jobsService.updateImage$(id, file)),
        takeUntil(this.ngOnDestroy$)
      ).subscribe((_: IUploadImageResponse) => {
        this.src = _.url;
      });
      this.uploadedImageName = file.name;
    } else {
      this.uploadedImageName = null;
    }
    this.handleFormChange('body.image', file ? this.uploadedImageName : null);
  }

  public handleFormChange(key: string, value: any): void {
    this.form.get(key).setValue(value);
  }

  public onSubmit(): void {
    if (this.form.valid) {
      this.jobId$.pipe(
        switchMap((id: number) => this.jobsService.getSingle$(id)),
        switchMap((_: IJobViewFull) => this.sendPatch$(_).pipe(
          switchMap(() => this.jobsService.publish$(_.meta.id)),
          switchMap(() => from(this.router.navigate(['/jobs', _.meta.id]))),
        )),
        takeUntil(this.ngOnDestroy$)
      ).subscribe();
    }
  }
}
