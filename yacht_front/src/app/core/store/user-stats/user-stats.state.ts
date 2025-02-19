import { Injectable } from '@angular/core';
import { State, Action, StateContext, StateToken } from '@ngxs/store';
import { IUserStatsState } from './interfaces/user-stats-state.interface';
import { USER_STATS_STATE } from './consts/users-stats-state.const';
import { TopicsService } from '@api/routes/topics.service';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { tap, map } from 'rxjs/operators';
import { UsersService } from '@api/routes/users.service';
import { LocaleEnum } from '@api/schemas/locale/locale.enum';
import { IUserView } from '@api/schemas/user/user-view.interface';
import { Observable, combineLatest } from 'rxjs';
import { CompaniesService } from '@api/routes/companies.service';
import { ICompanyView } from '@api/schemas/company/company-view.interface';
import { SessionService } from '@app/services/session.service';
import { IEventView } from '@api/schemas/event/event-view.interface';
import { IJobView } from '@api/schemas/job/job-view.interface';
import { EventsService } from '@api/routes/events.service';
import { JobsService } from '@api/routes/jobs.service';
import { FeedService } from '@api/routes/feed.service';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { PublicationStageEnum } from '@api/schemas/article/publication-stage.enum';
import { AddToProperty } from './actions/add-to-property.action';
import { UpdateProperty } from './actions/update-property.action';
import { EUserStatsProperty } from './enums/user-stats-property.enum';


export const USER_STATS_STATE_TOKEN = new StateToken<IUserStatsState>('userStats');

@State<IUserStatsState>({
  name: USER_STATS_STATE_TOKEN,
  defaults: USER_STATS_STATE
})
@Injectable()
export class UserStatsState {
  constructor(
    private readonly topicsService: TopicsService,
    private readonly usersService: UsersService,
    private readonly companiesService: CompaniesService,
    private readonly sessionService: SessionService,
    private readonly eventsService: EventsService,
    private readonly jobsService: JobsService,
    private readonly feedService: FeedService
  ) {}

  @Action(AddToProperty)
  public incrementTopics(ctx: StateContext<IUserStatsState>, action: AddToProperty): void {
    const state = ctx.getState();
    const newState = { ...state };
    newState[action.property] += action.addNumber;
    ctx.setState(newState);
  }

  @Action(UpdateProperty)
  public updateProperty(ctx: StateContext<IUserStatsState>, action: UpdateProperty): Observable<IPageResponse<any>> | Observable<number> {
    switch (action.property) {
      case EUserStatsProperty.TOPICS:
        return this.topicsService.get$(0, { sub: true }).pipe(tap((response: IPageResponse<ITopicView>) => {
          const state = ctx.getState();
          ctx.setState({
            ...state,
            topics: response.total
          });
        }));
      case EUserStatsProperty.AUTHORS:
        return this.usersService.get$(0, { sub: true, locale: LocaleEnum.ALL }).pipe(tap((response: IPageResponse<IUserView>) => {
          const state = ctx.getState();
          ctx.setState({
            ...state,
            authors: response.total
          });
        }));
      case EUserStatsProperty.COMPANIES:
        return this.companiesService.get$(0, { sub: true }).pipe(tap((response: IPageResponse<ICompanyView>) => {
          const state = ctx.getState();
          ctx.setState({
            ...state,
            companies: response.total
          });
        }));
      case EUserStatsProperty.PROMOTED:
        return combineLatest([
          this.feedService.count$({ bookmark: true, bookmarked: this.sessionService.userId }),
          this.eventsService.getBookmarked$(this.sessionService.userId, 0),
          this.jobsService.getBookmarked$(this.sessionService.userId, 0)
        ]).pipe(
          map(([articles, events, jobs]: [number, IPageResponse<IEventView>, IPageResponse<IJobView>]) =>
            articles + events.total + jobs.total),
          tap((count: number) => {
            const state = ctx.getState();
            ctx.setState({
              ...state,
              promoted: count
            });
          })
        );
      case EUserStatsProperty.POSTS:
        return this.usersService.getSingle$(this.sessionService.userId).pipe(
          map((user: IUserViewFull) => user?.postCount),
          tap((count: number) => {
            const state = ctx.getState();
            ctx.setState({
              ...state,
              posts: count
            });
          })
        );
      case EUserStatsProperty.DRAFTS:
        return this.feedService.count$({ author: this.sessionService.userId, stage: [PublicationStageEnum.DRAFT] }).pipe(
          tap((count: number) => {
            const state = ctx.getState();
            ctx.setState({
              ...state,
              drafts: count
            });
          })
        );
      case EUserStatsProperty.COMMENTS:
        return this.usersService.commentCount$(this.sessionService.userId).pipe(tap((response: number) => {
          const state = ctx.getState();
          ctx.setState({
            ...state,
            comments: response
          });
        }));
    }
  }
}
