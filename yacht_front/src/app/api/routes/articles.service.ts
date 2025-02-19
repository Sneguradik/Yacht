import { Injectable } from '@angular/core';
import { BaseStatus } from '@api/classes/base-status/base-status.class';
import { ApiService } from '@api/services/api.service';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ICreatedObject } from '@api/schemas/object/created-object.interface';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { IArticleViewFull } from '@api/schemas/article/article-view-full.interface';
import { ICommentViewArticle } from '@api/schemas/comment/comment-view-article.interface';
import { fileToFormData } from '@api/functions/file-to-formdata.function';
import { BaseStatusActionEnum } from '@api/classes/base-status/base-status-action.enum';
import { Store } from '@ngxs/store';

const CONTROLLER_ENDPOINT = 'articles';

@Injectable({
  providedIn: 'root'
})
export class ArticlesService extends BaseStatus {
  constructor(
    protected readonly apiService: ApiService,
    protected readonly store: Store
  ) {
    super(apiService, CONTROLLER_ENDPOINT, store);
  }

  public getSingle$(id: number): Observable<IArticleViewFull> {
    return this.apiService.fingerprintAnonymousRequest$(`${ CONTROLLER_ENDPOINT }/${ id }`, false)
      .pipe(switchMap((url: string) => this.apiService.get$<IArticleViewFull>(url, true)));
  }

  public create$(): Observable<number> {
    return this.apiService.post$<ICreatedObject>(CONTROLLER_ENDPOINT).pipe(map((_: ICreatedObject) => _.id));
  }

  public copy$(id: number): Observable<number> {
    return this.apiService.post$<ICreatedObject>(`${ CONTROLLER_ENDPOINT }/${ id }/clone`).pipe(map((_: ICreatedObject) => _.id));
  }

  public delete$(id: number): Observable<never> {
    return this.apiService.delete$<never>(`${ CONTROLLER_ENDPOINT }/${ id }`);
  }

  public comments$(id: number): Observable<IPageResponse<ICommentViewArticle>> {
    return this.apiService.get$<IPageResponse<ICommentViewArticle>>(`${ CONTROLLER_ENDPOINT }/${ id }/comments`, true);
  }

  public updateTitle$(id: number, title: string): Observable<never> {
    return this.apiService.put$<never>(`${ CONTROLLER_ENDPOINT }/${ id }/title`, { title });
  }

  public updateSummary$(id: number, summary: any): Observable<never> {
    return this.apiService.put$<never>(`${ CONTROLLER_ENDPOINT }/${ id }/summary`, { summary });
  }

  public updateCover$(id: number, cover: File): Observable<never> {
    return this.apiService.put$<never>(`${ CONTROLLER_ENDPOINT }/${ id }/cover`, fileToFormData(cover));
  }

  public putSource$(id: number, source: string): Observable<never> {
    return this.apiService.put$<never>(`${ CONTROLLER_ENDPOINT }/${ id }/source`, { data: source ? source : '' });
  }

  public getSource$(id: number): Observable<string> {
    return this.apiService.get$<{ data: any }>(`${ CONTROLLER_ENDPOINT }/${ id }/source`).pipe(map((_: { data: any }) => _.data));
  }

  public putTopics$(id: number, topics: number[]): Observable<never> {
    return this.apiService.put$<never>(`${ CONTROLLER_ENDPOINT }/${ id }/topics`, { topics });
  }

  public putTags$(id: any, tags: number[]): Observable<never> {
    return this.apiService.put$<never>(`${ CONTROLLER_ENDPOINT }/${ id }/tags`, { tags });
  }

  public commentsForArticle$(id: number): Observable<ICommentViewArticle[]> {
    return this.apiService.get$<ICommentViewArticle[]>(`${ CONTROLLER_ENDPOINT }/${ id }/comments`, true);
  }

  public createComment$(id: number, content: string): Observable<ICommentViewArticle> {
    return this.apiService.post$<ICommentViewArticle>(`${ CONTROLLER_ENDPOINT }/${ id }/comments`, { content });
  }

  public replyToComment$(id: number, parent: number, content: string): Observable<ICommentViewArticle> {
    return this.apiService.post$<ICommentViewArticle>(`${ CONTROLLER_ENDPOINT }/${ id }/comments/${ parent }/reply`, { content });
  }

  public pin$(id: number, undo: boolean): Observable<never> {
    return this.toggleStatus$(id, BaseStatusActionEnum.PIN, undo);
  }

  public publish$(id: number, undo?: boolean): Observable<never> {
    return this.toggleStatus$(id, BaseStatusActionEnum.PUBLISH, undo);
  }

  public promote$(id: number, undo: boolean = false): Observable<never> {
    return this.toggleStatus$(id, BaseStatusActionEnum.PROMOTE, undo);
  }

  public block$(id: number, undo: boolean = false): Observable<never> {
    return this.toggleStatus$(id, BaseStatusActionEnum.BLOCK, undo);
  }

  public submit$(id: number, undo: boolean = false): Observable<never> {
    return this.toggleStatus$(id, BaseStatusActionEnum.SUBMIT, undo);
  }
}
