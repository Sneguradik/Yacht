import { Injectable } from '@angular/core';
import { TagsService } from '@api/routes/tags.service';
import { ITagSimpleView } from '@shared/interfaces/tag-simple-view.interface';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ResolveTagsService {
  constructor(private readonly tagsService: TagsService) { }

  public resolveTagIds$(tags: ITagSimpleView[]): Observable<number[]> {
    return tags.length > 0
      ? forkJoin(
          tags.map((tag: ITagSimpleView) => {
            let result: Observable<number>;
            if (!tag.id) {
              result = this.tagsService.find$(tag.content).pipe(
                switchMap((_: number) => _ ? of(_) : this.tagsService.create$(tag.content)),
              );
            } else if (typeof tag.id === 'number') {
              result = of(tag.id);
            }
            return result;
          }),
        )
      : of([]);
  }
}
