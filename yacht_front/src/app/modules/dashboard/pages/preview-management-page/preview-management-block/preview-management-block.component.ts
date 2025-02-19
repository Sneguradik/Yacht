import { Component, ChangeDetectionStrategy, Output, Input, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { IPreviewManagementView } from '@api/schemas/dashboard/preview-management-view.interface';
import { IPreviewManagementCreate } from '@api/schemas/dashboard/preview-management-create.interface';
import { PreviewSiteTypeEnum } from '@api/schemas/dashboard/preview-site-type.enum';

@Component({
  selector: 'app-preview-management-block',
  templateUrl: './preview-management-block.component.html',
  styleUrls: ['./preview-management-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewManagementBlockComponent implements OnChanges {
  @Input() public inputData: IPreviewManagementView;
  @Input() public saved = false;

  @Output() public readonly saveReq: EventEmitter<IPreviewManagementCreate> = new EventEmitter<IPreviewManagementCreate>();
  @Output() public readonly pictureReq: EventEmitter<[File, IPreviewManagementCreate]>
    = new EventEmitter<[File, IPreviewManagementCreate]>();

  public data: IPreviewManagementCreate = {
    title: null,
    siteName: null,
    description: null,
    url: 'default',
    type: PreviewSiteTypeEnum.WEBSITE,
    card: 'summary'
  };

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.inputData) {
      this.data = {
        ...this.data,
        title: this.inputData?.title,
        siteName: this.inputData?.siteName,
        description: this.inputData?.description,
      };
    }
  }

  public onImageChange(files: FileList): void {
    const image = files ? files[0] : null;
    this.pictureReq.emit([image, this.data]);
  }

  public save(): void {
    this.saveReq.emit(this.data);
  }
}
