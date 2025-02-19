import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { UserDropdownService } from '@layout/shared/services/user-dropdown.service';
import { FormControl, Validators } from '@angular/forms';


@Component({
  selector: 'app-comment-editor',
  templateUrl: './comment-editor.component.html',
  styleUrls: ['./comment-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentEditorComponent implements OnInit {
  @Output() public readonly send: EventEmitter<string> = new EventEmitter<string>();
  @Output() public readonly closeButton: EventEmitter<never> = new EventEmitter<never>();

  @Input() public mainBlock = true;
  @Input() public isLogged!: boolean;

  public collapsed = true;

  public commentFormControl = new FormControl('', [
    Validators.required,
    Validators.maxLength(1000)
  ]);

  constructor(
    private readonly userDropdownService: UserDropdownService,
    private readonly cd: ChangeDetectorRef
  ) {}

  public clear(): void {
    this.commentFormControl.setValue('');
    this.collapse();
  }

  public collapse(): void {
    this.collapsed = true;
    this.cd.markForCheck();
  }

  ngOnInit(): void {
    this.mainBlock ? (this.collapsed = true) : (this.collapsed = false);
  }

  public submit(): void {
    if (this.isLogged) {
      this.send.emit(this.commentFormControl.value);
      this.clear();
    } else {
      this.userDropdownService.setShowDropdown(true);
      this.collapse();
    }
  }

  public close(event: any): void {
    event.stopPropagation();
    if (!this.mainBlock) {
      this.closeButton.emit();
    } else {
      this.collapse();
    }
  }
}
