import { Component, OnInit, OnDestroy } from '@angular/core';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { INotSetting } from '@api/schemas/notification/not-setting.interface';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { UsersService } from '@api/routes/users.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationsService } from '@api/routes/notifications.service';
import { takeUntil, map, tap, catchError, switchMap } from 'rxjs/operators';
import { Observable, of, throwError, forkJoin, from } from 'rxjs';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';
import { IUploadImageResponse } from '@api/schemas/image/upload-image-response.interface';
import { idMap } from '@shared/utils/id-map.operator';

function stripEmpty<T extends {}>(object: T): Partial<T> {
  return Object.keys(object).reduce((result: {}, key: string) => {
    const value = object[key];
    result[key] = value === '' ? null : value;
    return result;
  }, {});
}

@Component({
  selector: 'app-user-edit-page',
  templateUrl: './user-edit-page.component.html',
  styleUrls: ['./user-edit-page.component.scss']
})
export class UserEditPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  private user$: Observable<IUserViewFull>;

  public user: IUserViewFull;
  public data: INotSetting[];

  public form: FormGroup = null;
  public userId: number | string;
  public cover: File;
  public coverSrc: string | ArrayBuffer;
  public photo: File;
  public photoSrc: string | ArrayBuffer;
  public photoAlt: string;

  public photoRemove = false;
  public coverRemove = false;

  public userError = false;

  public get isCompany(): boolean {
    return this.user.info.company.isCompany;
  }

  constructor(
    private readonly usersService: UsersService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly notificationsService: NotificationsService,
    private readonly sidebarWrapperService: SidebarWrapperService
  ) {
    super();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: true, navigation: true, live: false, showSidebar: true });
    });

    this.user$ = this.activatedRoute.paramMap.pipe(
      idMap(),
      switchMap((id: string | number) => this.usersService.getSingle$(id))
    );

    this.notificationsService.getSettings$().pipe(takeUntil(this.ngOnDestroy$)).subscribe((_: INotSetting[]) => {
      this.data = _;
    });
    this.user$.pipe(
      tap((user: IUserViewFull) => (this.user = user)),
      switchMap((user: IUserViewFull) => this.createForm$(user)),
      takeUntil(this.ngOnDestroy$),
    ).subscribe((form: FormGroup) => (this.form = form));
  }

  private createForm$(userViewFull: IUserViewFull): Observable<FormGroup> {
    return of(userViewFull).pipe(
      map((user: IUserViewFull) => {
        this.photoAlt = user.info.firstName + ' ' + user.info.lastName;
        this.photoSrc = user.info.picture;
        this.coverSrc = user.profile.cover;

        return this.fb.group({
          info: this.fb.group({
            firstName: this.fb.control(user.info.firstName),
            lastName: this.fb.control(user.info.lastName),
            username: this.fb.control(user.info.username),
            photo: this.fb.control(user.info.picture || ''),
            bio: this.fb.control(user.info.bio || ''),
            company: this.fb.group({
              name: this.fb.control(user.info.company.name || ''),
            }),
          }),

          profile: this.fb.group({
            cover: this.fb.control(user.profile.cover || ''),
            fullDescription: this.fb.control(user.profile.fullDescription),
          }),

          contacts: this.fb.group({
            email: this.fb.control(user.contacts.email),
            websiteUrl: this.fb.control(user.contacts.websiteUrl),
            phone: this.fb.control(user.contacts.phone),
            instagram: this.fb.control(user.contacts.instagram),
            vk: this.fb.control(user.contacts.vk),
            facebook: this.fb.control(user.contacts.facebook),
            twitter: this.fb.control(user.contacts.twitter),
            youtube: this.fb.control(user.contacts.youtube),
            telegram: this.fb.control(user.contacts.telegram),
          }),
        });
      }),

      catchError(() => {
        return of(null);
      }),
      takeUntil(this.ngOnDestroy$),
    );
  }

  private update(anotherUser: boolean): void {
    const observables: Observable<any>[] = [
      this.usersService.updateProfile$(
        {
          firstName: this.form.get('info.firstName').value,
          lastName: this.form.get('info.lastName').value,
          bio: this.form.get('info.bio').value,
          fullDescription: this.form.get('profile.fullDescription').value,
          company: {
            name: this.form.get('info.company.name').value,
          },
          contact: stripEmpty(this.form.get('contacts').value),
        },
        anotherUser ? this.user.meta.id : null,
      ),
    ];

    if (this.user.info.username !== this.form.get('info.username').value) {
      observables.push(
        this.usersService.setUsername$(this.form.get('info.username').value, anotherUser ? this.user.meta.id : null).pipe(
          catchError((err: any) => {
            err.status === 400 ? (this.userError = true) : (this.userError = false);
            throw throwError('username error');
          }),
        ),
      );
    }

    if (this.photo || this.photoRemove) {
      observables.push(this.usersService.updateAvatar$(this.photo, anotherUser ? this.user.meta.id : null));
    }

    if (this.cover || this.coverRemove) {
      observables.push(this.usersService.updateCover$(this.cover, anotherUser ? this.user.meta.id : null));
    }

    observables.push(this.notificationsService.postSettings$(this.data));

    forkJoin(observables).pipe(
      switchMap(() => from(this.router.navigateByUrl(`user/${this.user.meta.id}`))),
      switchMap(() => of(window.location.reload())),
      takeUntil(this.ngOnDestroy$),
    ).subscribe();
  }

  public importPictureFromFB(): void {
    this.usersService.setFBPicture$().pipe(takeUntil(this.ngOnDestroy$)).subscribe((_: IUploadImageResponse) => {
      this.photoSrc = _.url;
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
    this.photoSrc = null;
    this.photo = null;
    this.photoRemove = true;
  }

  public onCoverRemove(): void {
    this.coverSrc = null;
    this.cover = null;
    this.coverRemove = true;
  }

  public onCancel(): void {
    this.router.navigate(['/user', this.user.info.username ? this.user.info.username : this.user.meta.id]);
  }

  public onSubmit(): void {
    let anotherUser = false;
    this.usersService.me$().pipe(takeUntil(this.ngOnDestroy$)).subscribe((_: IUserViewFull) => {
      if (_.meta.id !== this.user.meta.id && (_.roles.includes('ROLE_SUPERUSER') || _.roles.includes('ROLE_CHIEF_EDITOR'))) {
        anotherUser = true;
      }
      this.update(anotherUser);
    });
  }
}
