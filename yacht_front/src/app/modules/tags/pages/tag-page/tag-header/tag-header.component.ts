import { Component, Input } from '@angular/core';
import { ITagView } from '@api/schemas/tags/tag-view.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tag-header',
  templateUrl: './tag-header.component.html',
  styleUrls: ['./tag-header.component.scss']
})
export class TagHeaderComponent {
  @Input() public tag: ITagView;

  constructor(
    public readonly router: Router
  ) { }
}
