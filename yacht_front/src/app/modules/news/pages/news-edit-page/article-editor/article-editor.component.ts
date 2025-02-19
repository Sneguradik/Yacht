import {
  Component,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
  Input,
  SimpleChanges,
  OnDestroy,
  OnChanges,
} from '@angular/core';
import { asyncScheduler, BehaviorSubject, ReplaySubject } from 'rxjs';
import { IArticleViewFull } from '@api/schemas/article/article-view-full.interface';
import { CKEditorComponent } from '@ckeditor/ckeditor5-angular';
import { IArticleView } from '@api/schemas/article/article-view.interface';
import { PublicationStageEnum } from '@api/schemas/article/publication-stage.enum';
import { debounceTime, filter, tap, takeUntil } from 'rxjs/operators';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { ITagView } from '@api/schemas/tags/tag-view.interface';
import { ITagSimpleView } from '@shared/interfaces/tag-simple-view.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-article-editor',
  templateUrl: './article-editor.component.html',
  styleUrls: ['../article-editor-shared-styles.scss']
})
export class ArticleEditorComponent extends AbstractComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('editor') public ed: any;

  @Input() public article: IArticleViewFull;
  @Input() public initialData: string;
  @Input() public tags: ITagView[] = [];
  @Input() public allTopics: ITopicView;
  @Input() public suggestions: ITopicView[];
  @Input() public isMediumResponsive: boolean;

  @Output() public readonly gone: EventEmitter<any> = new EventEmitter<any>();
  @Output() public readonly putSourceReq: EventEmitter<string> = new EventEmitter<string>();
  @Output() public readonly updateTopicsReq: EventEmitter<number[]> = new EventEmitter<number[]>();
  @Output() public readonly updateCoverReq: EventEmitter<File> = new EventEmitter<File>();
  @Output() public readonly updateSummaryReq: EventEmitter<string> = new EventEmitter<string>();
  @Output() public readonly updateTitleReq: EventEmitter<string> = new EventEmitter<string>();
  @Output() public readonly saveAndPublishReq: EventEmitter<IArticleView> = new EventEmitter<IArticleView>();
  @Output() public readonly tagsSuggestionsReq: EventEmitter<string> = new EventEmitter<string>();
  @Output() public readonly tagsUploadReq: EventEmitter<ITagSimpleView[]> = new EventEmitter<ITagSimpleView[]>();

  public readonly dataChanged$: ReplaySubject<void> = new ReplaySubject<void>(1);
  public readonly isSubmitting$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly wysiwygValueChange$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  public editor: CKEditorComponent;
  public form: FormGroup;
  public coverSrc: string;
  public openEditor = false;

  public currentArticle: IArticleView;

  public published: boolean;

  public authorId = -1;
  public topicPrev: ITopicView;

  public id: number;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.dataChanged$.pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.setData();
      this.setForm();
    });
    this.setEditorUpdate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.article || changes.initialData) && this.article) {
      this.dataChanged$.next();
    }
  }

  private setData(): void {
    this.currentArticle = this.article;
    this.published = this.article.status.publicationStage === PublicationStageEnum.PUBLISHED;
    if (this.article.info.cover !== null) {
      this.coverSrc = this.article.info.cover;
    }
    this.authorId = this.article.author.meta.id;
    this.currentArticle.topics = this.article.topics;
  }

  private setEditorUpdate(): void {
    this.wysiwygValueChange$.pipe(
      debounceTime(300),
      takeUntil(this.ngOnDestroy$),
    ).subscribe((value: string) => {
      if (value !== '') {
        this.putSourceReq.emit(value);
        this.article.html = value;
      }
    });
  }

  private setForm(): void {
    const group: FormGroup = this.fb.group({
      title: this.fb.control(this.article.info.title),
      summary: this.fb.control(this.article.info.summary),
      cover: this.fb.control(this.article.info.cover),
    });

    group.valueChanges.pipe(
      debounceTime(300, asyncScheduler),
      filter((_: any) => _.title !== this.currentArticle.info.title || _.summary !== this.currentArticle.info.summary),
      tap((_: any) => {
        if (_.title !== this.currentArticle.info.title) {
          this.updateTitleReq.emit(_.title);
          this.currentArticle.info.title = _.title;
        }
        if (_.summary !== this.currentArticle.info.summary) {
          this.updateSummaryReq.emit(_.summary);
          this.currentArticle.info.summary = _.summary;
        }
      }),
      takeUntil(this.ngOnDestroy$),
    ).subscribe();

    this.form = group;
  }

  public openEdit(): void {
    this.openEditor = true;
    setTimeout(() => {
      this.ed.focus();
    });
  }

  public tagsSuggestions(tags: string): void {
    this.tagsSuggestionsReq.emit(tags);
  }

  public tagsUpload(tags: ITagSimpleView[]): void {
    this.tagsUploadReq.emit(tags);
  }

  public updateTopics(topics?: number[]): void {
    this.updateTopicsReq.emit(topics ? topics : this.currentArticle.topics);
  }

  public onCoverUpload(files: FileList): void {
    const cover: File = files[0];
    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = (e: any) => {
      this.coverSrc = e.target.result;
    };
    this.updateCoverReq.emit(cover);
  }

  public saveAndPublish(): void {
    this.saveAndPublishReq.emit(this.currentArticle);
  }

  public saveAsDraft(): void {
    this.router.navigate(['/user', this.currentArticle.author.info.username
      ? this.currentArticle.author.info.username : this.currentArticle.author.meta.id, 'drafts']);
  }

  public topicsChange(topics: number[]): void {
    this.currentArticle.topics = topics;
  }
}
