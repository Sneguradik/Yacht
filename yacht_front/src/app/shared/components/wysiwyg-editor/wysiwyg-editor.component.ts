import { Component, Input, EventEmitter, Output, ViewChild, OnInit, ElementRef } from '@angular/core';
import { CKEditorComponent, CKEditor5, ChangeEvent } from '@ckeditor/ckeditor5-angular';
import { WysiwygEditorService } from './wysiwyg-editor.service';
import { PlatformService } from '@shared/services/platform.service';
import { TOOLBAR } from './wysiwyg-editor.const';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-wysiwyg-editor',
  templateUrl: './wysiwyg-editor.component.html',
  styleUrls: ['./wysiwyg-editor.component.scss'],
})
export class WysiwygEditorComponent implements OnInit {
  @ViewChild('ckeditor') private editorOut: CKEditorComponent;

  @Input() public id = 'toolbar-container';
  @Input() public initialData: string;
  @Input() public readOnly = false;

  @Output() public readonly valueChange: EventEmitter<string> = new EventEmitter<string>();

  public editor: CKEditor5.EditorConstructor;
  public editorComponent: CKEditor5.Editor;
  public config: CKEditor5.Config = null;
  public ready = false;
  public parsedString = '';

  constructor(
    private readonly wysiwygEditorService: WysiwygEditorService,
    private readonly translateService: TranslateService,
    public readonly platformService: PlatformService,
    public el: ElementRef
  ) {
    if (this.platformService.isBrowser) {
      const ClassicEditor = require('@ckeditor/ckeditor5-build-decoupled-document');
      this.editor = ClassicEditor;
      this.config = {
        toolbar: TOOLBAR,
        heading: {
          options: [
            { model: 'paragraph', title: this.translateService.instant('EDITOR.TEXT'), class: 'ck-heading_paragraph' },
            { model: 'heading2', view: 'h2', title: 'h2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'h3', class: 'ck-heading_heading3' }
          ]
        },
        language:  this.translateService.currentLang,
        link: { addTargetToExternalLinks: true },
      };
    }
  }

  ngOnInit(): void {
    if (this.platformService.isBrowser && this.readOnly) {
      const parser = require('html-to-text');
      this.parsedString = parser.fromString(this.initialData, { ignoreHref: true });
    }
  }

  public onChange({ editor }: ChangeEvent): void {
    if (this.ready) {
      this.valueChange.emit(editor.getData());
    }
  }

  public onReady(editor: CKEditor5.Editor): void {
    this.editorComponent = editor;
    editor.setData(this.initialData || '');
    const toolbarContainer: Node = document.querySelector(`#${this.id}`);
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => this.wysiwygEditorService.createCkUploadAdapter(loader);
    if (!this.readOnly) {
      toolbarContainer.appendChild(editor.ui.view.toolbar.element);
    }
    setTimeout(() => (this.ready = true), 0);
  }

  public setValue(data: string): void {
    this.editorComponent.setData(data);
  }

  public focus(): void {
    this.editorOut.editorInstance.editing.view.focus();
  }

  public emit(eventName: string): void {
    this.el.nativeElement.dispatchEvent(new Event(eventName, { bubbles: true }));
  }
}
