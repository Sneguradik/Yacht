import { Component, OnInit, OnDestroy } from '@angular/core';
import { ITopicViewFull } from '@api/schemas/topic/topic-view-full.interface';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TopicsService } from '@api/routes/topics.service';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';
import { Observable, of, forkJoin } from 'rxjs';
import { map, takeUntil, tap, switchMap } from 'rxjs/operators';
import { PermissionService } from '@app/services/permission/permission.service';

@Component({
  selector: 'app-topic-edit-page',
  templateUrl: './topic-edit-page.component.html',
  styleUrls: ['./topic-edit-page.component.scss']
})
export class TopicEditPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  private topic: ITopicViewFull = null;
  private id = -1;
  private pathId: number | string;

  public form: FormGroup = null;
  public cover: File;
  public coverRemove = false;
  public coverSrc: string | ArrayBuffer;
  public photo: File;
  public photoRemove = false;
  public photoSrc: string | ArrayBuffer;
  public photoAlt: string;

  constructor(
    private readonly router: Router,
    private readonly topicsService: TopicsService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly permissionService: PermissionService,
    private readonly sidebarWrapperService: SidebarWrapperService
  ) {
    super();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: true, navigation: true, live: false, showSidebar: true });
    });

    this.returnOrInit();
  }

  private createForm$(topicViewFull: ITopicViewFull): Observable<FormGroup> {
    return of(topicViewFull).pipe(
      map((topic: ITopicViewFull) => {
        this.photoAlt = topic.info.name;
        this.photoSrc = topic.info.picture;
        this.coverSrc = topic.profile.cover;

        const group: FormGroup = this.fb.group({
          info: this.fb.group({
            name: this.fb.control(topic.info.name),
            description: this.fb.control(topic.info.description || ''),
            photo: this.fb.control(topic.info.picture || ''),
          }),

          profile: this.fb.group({
            cover: this.fb.control(topic.profile.cover || ''),
            fullDescription: this.fb.control(topic.profile.fullDescription),
          }),
        });

        return group;
      }),
    );
  }

  private returnOrInit(): void {
    this.pathId = this.activatedRoute.snapshot.params['id'];
    this.permissionService.hasAnyRole$(this.permissionService.roles.EDITOR$).pipe(
      tap((_: boolean) => {
        if (!_) {
          this.router.navigateByUrl(`topics/${this.pathId}`);
        }
      }),
      switchMap((_: boolean) => this.topicsService.getOne$(this.pathId)),
      switchMap((_: ITopicViewFull) => {
        this.topic = _;
        this.id = _.meta.id;
        return this.createForm$(this.topic);
      }),
      takeUntil(this.ngOnDestroy$)
    ).subscribe((_: any) => {
      this.form = _;
    });
  }

  public onCoverChange(files: FileList): void {
    this.cover = files[0];
    this.coverRemove = false;
    const reader: FileReader = new FileReader();

    reader.readAsDataURL(files[0]);
    reader.onload = (e: any) => {
      this.coverSrc = e.target.result;
    };
  }

  public onPhotoChange(files: FileList): void {
    this.photo = files[0];
    this.photoRemove = false;
    const reader: FileReader = new FileReader();

    reader.readAsDataURL(files[0]);
    reader.onload = (e: any) => {
      this.photoSrc = e.target.result;
    };
  }

  public onPhotoRemove(): void {
    this.photo = null;
    this.photoSrc = null;
    this.photoRemove = true;
  }

  public onCoverRemove(): void {
    this.cover = null;
    this.coverSrc = null;
    this.coverRemove = true;
  }

  public onCancel(): void {
    this.router.navigateByUrl(`topics/${this.id}`);
  }

  public onSubmit(): void {
    const observables: Observable<any>[] = [
      this.topicsService.update$(this.id, {
        name: this.form.get('info.name').value,
        description: this.form.get('info.description').value,
        fullDescription: this.form.get('profile.fullDescription').value,
      }),
    ];

    if (this.photo || this.photoRemove) {
      observables.push(this.topicsService.updateAvatar$(this.id, this.photo));
    }

    if (this.cover || this.coverRemove) {
      observables.push(this.topicsService.updateCover$(this.id, this.cover));
    }

    forkJoin(observables).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.router.navigateByUrl(`topics/${this.id}`);
    });
  }
}
