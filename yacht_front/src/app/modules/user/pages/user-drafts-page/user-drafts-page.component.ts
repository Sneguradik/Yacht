import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractUserPosts } from '@shared/classes/abstract-user-posts.class';
import { ActivatedRoute } from '@angular/router';
import { SessionService } from '@app/services/session.service';
import { FeedService } from '@api/routes/feed.service';
import { TranslateService } from '@ngx-translate/core';
import { UsersService } from '@api/routes/users.service';
import { TopicsService } from '@api/routes/topics.service';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';

@Component({
  selector: 'app-user-drafts-page',
  templateUrl: './user-drafts-page.component.html',
  styleUrls: ['./user-drafts-page.component.scss']
})
export class UserDraftsPageComponent extends AbstractUserPosts implements OnInit, OnDestroy {
  constructor(
    activatedRoute: ActivatedRoute,
    sessionService: SessionService,
    feedService: FeedService,
    translateService: TranslateService,
    usersService: UsersService,
    topicsService: TopicsService,
    private readonly sidebarWrapperService: SidebarWrapperService
  ) {
    super(activatedRoute, sessionService, feedService, translateService, usersService, topicsService);
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: true, navigation: true, live: false, showSidebar: true });
    });

    super.ngOnInit();
  }
}
