import { Component, OnDestroy } from '@angular/core';
import { NotificationsService } from '@api/routes/notifications.service';
import { ArticlesService } from '@api/routes/articles.service';
import { TopicsService } from '@api/routes/topics.service';
import { TagsService } from '@api/routes/tags.service';
import { UsersService } from '@api/routes/users.service';
import { AbstractNotificationComponent } from '@shared/classes/abstract-notification-component/abstract-notification-component.class';
import { PersonNamePipe } from '@shared/pipes/person-name.pipe';


@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent extends AbstractNotificationComponent implements OnDestroy {
  constructor(
    protected readonly notificationsService: NotificationsService,
    protected readonly articlesService: ArticlesService,
    protected readonly topicsService: TopicsService,
    protected readonly tagsService: TagsService,
    protected readonly usersService: UsersService,
    protected readonly personNamePipe: PersonNamePipe
  ) { super(notificationsService, articlesService, topicsService, tagsService, usersService, personNamePipe); }
}
