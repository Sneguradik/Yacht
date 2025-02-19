import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { ResponsiveService } from '@app/services/responsive.service';

@Component({
  selector: 'app-topic-view',
  templateUrl: './topic-view.component.html',
  styleUrls: ['./topic-view.component.scss']
})
export class TopicViewComponent {
  @Input() public topic: ITopicView;

  @Output() public readonly subscribeEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() public readonly gone: EventEmitter<ITopicView> = new EventEmitter<ITopicView>();

  constructor(public readonly responsive: ResponsiveService) {}

  public toggleSubscribe(): void {
    this.subscribeEvent.emit(!this.topic.subscribers.you);
  }
}
