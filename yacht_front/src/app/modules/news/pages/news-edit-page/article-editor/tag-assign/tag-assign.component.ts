import { Component, Input, Output, EventEmitter, ViewChild, ViewChildren, ElementRef, QueryList, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ITagView } from '@api/schemas/tags/tag-view.interface';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { first, takeUntil, debounceTime, tap } from 'rxjs/operators';
import { ITagSimpleView } from '@shared/interfaces/tag-simple-view.interface';

@Component({
  selector: 'app-tag-assign',
  templateUrl: './tag-assign.component.html',
  styleUrls: ['./tag-assign.component.scss']
})
export class TagAssignComponent extends AbstractComponent implements OnInit, OnDestroy {
  @ViewChild('searchResults') private searchResults: ElementRef;
  @ViewChild('addBtn') private addBtn: ElementRef;
  @ViewChildren('userTags') private tagObjects: QueryList<ElementRef>;

  @Input() public tags: ITagSimpleView[] = [];
  @Input() public suggestions: ITagView[] = [];

  @Output() public readonly suggestionsReq: EventEmitter<string> = new EventEmitter<string>();
  @Output() public readonly uploadTagsReq: EventEmitter<ITagSimpleView[]> = new EventEmitter<ITagSimpleView[]>();

  private readonly tagsUpdate$: Subject<any> = new Subject<any>();

  private currentlyEditedTag: HTMLInputElement;
  private currentlyEditedId: number;

  public readonly current$: Subject<string> = new Subject<string>();
  public readonly currentId$: Subject<number> = new Subject<number>();

  public set currentlyEdited(target: number) {
    this.currentId$.next(target);
    this.currentlyEditedId = target;
    const el = this.tagObjects.toArray()[target].nativeElement as HTMLLIElement;
    this.currentlyEditedTag = el.firstChild as HTMLInputElement;
    this.current$.next(this.currentlyEditedTag.value);
    el.appendChild(this.searchResults.nativeElement);
  }

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.tagsUpdate$.pipe(
      debounceTime(1500),
      tap(() => this.upload()),
      takeUntil(this.ngOnDestroy$),
    ).subscribe();
    this.current$.subscribe((tags: string) => this.updateSuggestions(tags));
  }

  @HostListener('document:click', ['$event']) public clicked(event: Event): void {
    if (this.addBtn && !this.addBtn.nativeElement.contains(event.target)) {
      this.blur();
    }
  }

  private upload(): void {
    this.uploadTagsReq.emit(this.tags);
  }

  private blur(): void {
    let pos = -1;
    for (const tag of this.tags) {
      pos++;
      if (tag.content === '') {
        this.remove(pos);
      }
    }
  }

  public change(tag: ITagSimpleView): void {
    if (tag.content) {
      tag.id = null;
      this.tagsUpdate$.next();
    }
  }

  public input(event: Event): boolean {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    const content: string = target.value.replace(/[^а-яa-z0-9_-]/gi, '');
    this.current$.next(content);
    return true;
  }

  public accept(tag: ITagView): void {
    if (tag.content) {
      this.tags[this.currentlyEditedId] = {
        content: tag.content,
        id: tag.meta.id,
      };
      this.tagsUpdate$.next();
    }
  }

  public add(): void {
    if (this.tags.length < 10) {
      this.tagObjects.changes.pipe(first(), takeUntil(this.ngOnDestroy$)).subscribe((list: QueryList<ElementRef>) => {
        list.last.nativeElement.firstChild.focus();
      });
      this.tags.push({ content: '', id: null });
      this.updateSuggestions('');
    }
  }

  public remove(i: number): void {
    this.tags.length > 1 ? this.tags.splice(i, 1) : (this.tags = []);
    this.upload();
  }

  public updateSuggestions(content: string): void {
    this.suggestionsReq.emit(content);
  }
}
