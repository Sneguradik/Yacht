import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-ui-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent {
  @Input() public src?: string;
  @Input() public textAlternative?: string;
  @Input() public size: 'small' | 'medium' | 'large' | 'xlarge' = 'medium';

  public get iconText(): string {
    let result = '';
    if (this.textAlternative) {
      const words = this.textAlternative.match(/\S+/g);
      result = (words || []).reduce((state: string, item: string, index: number): string => index > 1 ? state : state + item[0], '');
    }
    return result;
  }
}
