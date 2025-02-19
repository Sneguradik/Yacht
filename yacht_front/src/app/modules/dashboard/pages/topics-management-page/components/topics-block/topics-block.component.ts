import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ISelectItem } from '@modules/dashboard/shared/ui/dashboard-select/select-item.interface';
import { ITopic } from '@api/schemas/dashboard/topic.interface';
import { BehaviorSubject } from 'rxjs';
import { ITopicPageableContent } from '@modules/dashboard/pages/topics-management-page/topic-pageable-content.interface';

@Component({
  selector: 'app-topics-block',
  templateUrl: './topics-block.component.html',
  styleUrls: ['./topics-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopicsBlockComponent implements OnInit {
  @Input() public topics$: BehaviorSubject<ITopicPageableContent>;

  @Output() public readonly createReq: EventEmitter<ITopic> = new EventEmitter<ITopic>();
  @Output() public readonly deleteReq: EventEmitter<[number, string, number, string]> =
      new EventEmitter<[number, string, number, string]>();

  public createBody: ITopic = { name: '', url: '' };
  public tags = '';
  public deleteTopic: ISelectItem;
  public changeTopic: ISelectItem;

  constructor() {}

  public create(): void {
    this.createReq.emit(this.createBody);
  }

  ngOnInit(): void {
    this._clearChangedTopic();
  }

  private _clearChangedTopic(): void {
    this.topics$.subscribe(() => {
      if (this.deleteTopic && this.changeTopic) {
        this.deleteTopic = null;
        this.changeTopic = null;
      }
    });
  }

  filteredTopic(topicList: ISelectItem[], topicItem: ISelectItem): ISelectItem[] {
    if (topicItem) {
      return topicList.filter((item: ISelectItem) => item.id !== topicItem.id);
    } else {
      return topicList;
    }
  }

  public delete(): void {
    this.deleteReq.emit([this.deleteTopic.id, this.tags, this.changeTopic.id, this.deleteTopic.title]);
  }
}
