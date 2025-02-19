import { Component, Output, Input, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadComponent {
  @Input() public id = '';
  // tslint:disable-next-line:no-output-on-prefix
  @Output() public readonly onChange: EventEmitter<any> = new EventEmitter<any>();
}
