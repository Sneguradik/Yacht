import { Component, Input } from '@angular/core';
import { INotification } from '@api/schemas/notification/notification.interface';
import { TYPE_MAP } from '@modules/user/pages/user-notifications-page/notification/type-map.const';
import { ICommentNotificationBody } from '@api/schemas/notification/comment-notification-body.interface';
import { IReplyNotificationBody } from '@api/schemas/notification/reply-notification-body.interface';
import { IUserNotificationBody } from '@api/schemas/notification/user-notification-body.interface';
import { IShortPostNotificationBody } from '@api/schemas/notification/short-post-notification-body.interface';
import { IPostNotificationBody } from '@api/schemas/notification/post-notification-body.interface';
import { NotificationsService } from '@api/routes/notifications.service';
import { ArticlesService } from '@api/routes/articles.service';
import { TopicsService } from '@api/routes/topics.service';
import { TagsService } from '@api/routes/tags.service';
import { UsersService } from '@api/routes/users.service';
import { IReportNotificationBody } from '@api/schemas/notification/report-notification-body.interface';
import { takeUntil } from 'rxjs/operators';
import { IArticleViewFull } from '@api/schemas/article/article-view-full.interface';
import { ITopicViewFull } from '@api/schemas/topic/topic-view-full.interface';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { ITagView } from '@api/schemas/tags/tag-view.interface';
import { IReportNotificationBodyNew } from './report-notification-body-new.interface';
import { AbstractComponent } from '../abstract-component.class';
import { PersonNamePipe } from '@shared/pipes/person-name.pipe';


enum ENotificationBodyType {
  COMMENT_BODY = 'COMMENT_BODY',
  POST_BODY = 'POST_BODY',
  SHORT_POST_BODY = 'SHORT_POST_BODY',
  REPORT = 'REPORT',
  USER_BODY = 'USER_BODY',
  ACCOUNT_BANNED = 'ACCOUNT_BANNED',
  ACCOUNT_UNBANNED = 'ACCOUNT_UNBANNED',
  WATCHED_COMMENT_REPLY = 'WATCHED_COMMENT_REPLY',
  COMMENT_MENTION = 'COMMENT_MENTION'
}

@Component({
  template: ''
})
export abstract class AbstractNotificationComponent extends AbstractComponent {
  @Input() public set data(data: INotification) {
    this.item = data;
    this.setBodyTypeAndUrl();
    this.setBody();
  }

  public readonly TYPE_MAP: typeof TYPE_MAP = TYPE_MAP;
  public readonly NAME_MAP: { [type: string]: string } = {};
  public readonly notificationBodyType = ENotificationBodyType;

  public fragment: string = null;
  public url: any[] = [];
  public item: any;
  public bodyType: ENotificationBodyType;
  public body: any;

  constructor(
    protected readonly notificationsService: NotificationsService,
    protected readonly articlesService: ArticlesService,
    protected readonly topicsService: TopicsService,
    protected readonly tagsService: TagsService,
    protected readonly usersService: UsersService,
    protected readonly personNamePipe: PersonNamePipe
  ) { super(); }

  private setBodyTypeAndUrl(): void {
    switch (this.item.type) {
      case 'comment_reply':
      case 'post_comment':
      case 'bookmark_comment':
        this.fragment = 'comment-' + (this.item.body as ICommentNotificationBody).id;
        this.url = ['/news', (this.item.body as ICommentNotificationBody).context.id];
        this.bodyType = ENotificationBodyType.COMMENT_BODY;
        break;
      case 'post_submitted':
        this.url = ['/news', (this.item.body as IPostNotificationBody).id];
        this.bodyType = ENotificationBodyType.POST_BODY;
        break;
      case 'mod_post_blocked':
      case 'mod_post_unblocked':
      case 'mod_post_published':
      case 'mod_post_withdrawn':
      case 'mod_post_deleted':
      case 'post_reviewing':
      case 'post_drafted':
      case 'editor_message':
      case 'post_deleted':
        this.url = ['/news', (this.item.body as IShortPostNotificationBody).id];
        this.bodyType = ENotificationBodyType.SHORT_POST_BODY;
        break;
      case 'content_report':
        this.bodyType = ENotificationBodyType.REPORT;
        break;
      case 'new_subscriber':
        this.url = ['/user', (this.item.body as IUserNotificationBody).id];
        this.bodyType = ENotificationBodyType.USER_BODY;
        break;
      case 'account_banned':
        this.bodyType = ENotificationBodyType.ACCOUNT_BANNED;
        break;
      case 'account_unbanned':
        this.bodyType = ENotificationBodyType.ACCOUNT_UNBANNED;
        break;
      case 'watched_comment_reply':
        this.fragment = 'comment-' + (this.item.body as IReplyNotificationBody).reply.id;
        this.url = ['/news', (this.item.body as IReplyNotificationBody).reply.context.id];
        this.bodyType = ENotificationBodyType.WATCHED_COMMENT_REPLY;
        break;
      case 'comment_mention':
        this.url = ['/news', (this.item.body as ICommentNotificationBody).context.id];
        this.bodyType = ENotificationBodyType.COMMENT_MENTION;
        break;
      default:
        this.bodyType = null;
        break;
    }
  }

  private setBody(): void {
    switch (this.bodyType) {
      case ENotificationBodyType.USER_BODY:
        this.body = this.item.body as IUserNotificationBody;
        break;
      case ENotificationBodyType.COMMENT_BODY:
        this.body = this.item.body as ICommentNotificationBody;
        break;
      case ENotificationBodyType.POST_BODY:
        this.body = this.item.body as IPostNotificationBody;
        break;
      case ENotificationBodyType.SHORT_POST_BODY:
        this.body = this.item.body as IShortPostNotificationBody;
        break;
      case ENotificationBodyType.REPORT:
        this.setReportBody();
        break;
      default:
        this.body = null;
        break;
    }
  }

  public setReportBody(): void {
    const body: IReportNotificationBody = this.item.body as IReportNotificationBody;
    const ret: IReportNotificationBodyNew = body as IReportNotificationBodyNew;
    ret.id = body.id;
    ret.url = body.url;
    ret.owner = body.owner;
    if (body.message && !ret.entity) {
      const tempMessage = typeof body.message === 'string'
        ? JSON.parse(body.message.replace(/\\/g, ''))
        : body.message;
      ret.message = tempMessage.message;
      ret.entity = {
        name: null,
        id: null,
        idMeta: null,
      };
      ret.entity.id = +tempMessage.entity.id;
      switch (tempMessage.entity.name) {
        case 'news':
          ret.entity.name = 'публикацию';
          this.articlesService.getSingle$(ret.entity.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe((article: IArticleViewFull) => {
            ret.entity.idMeta = article.info.title ? article.info.title : '(Без названия)';
          });
          break;
        case 'topics':
          ret.entity.name = 'тему';
          this.topicsService.getOne$(ret.entity.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe((topic: ITopicViewFull) => {
            ret.entity.idMeta = topic.info.name;
          });
          break;
        case 'user':
          ret.entity.name = 'пользователя';
          this.usersService.getSingle$(ret.entity.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe((user: IUserViewFull) => {
            ret.entity.idMeta = this.personNamePipe.transform(user.info);
          });
          break;
        case 'tags':
          ret.entity.name = 'тег';
          this.tagsService.getSingle$(ret.entity.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe((tag: ITagView) => {
            ret.entity.idMeta = tag.content;
          });
          break;
        default:
          ret.entity.name = tempMessage.name;
          ret.entity.idMeta = ret.entity.id.toString();
      }
    } else if (!ret.entity) {
      ret.entity = {
        name: null,
        id: null,
        idMeta: null,
      };
    }
    this.body = ret;
  }
}
