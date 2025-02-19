import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { INavItem } from './nav-item.interface';
import { navItems } from './nav-items.function';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ResponsiveService } from '@app/services/responsive.service';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent extends AbstractComponent implements OnInit {
  @Input() public navItems: INavItem[] = navItems(this.translateService);
  @Input() public activeItem = '';
  @Input() public searchPlaceholder: string = this.translateService.instant('COMMON.SEARCH_BY_TOPIC');

  @Output() public readonly search: EventEmitter<string> = new EventEmitter<string>();

  public searchForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private translateService: TranslateService,
    public readonly responsive: ResponsiveService
  ) {
    super();
  }

  ngOnInit(): void {
    this.setSearchForm();
    this.handleQueryType();

    if (this.navItems[0].title === this.translateService.instant('COMMON.MAIN_TOPICS')) {
      this.responsive.lt.medium.subscribe((_: boolean) => _
        ? (this.navItems[0].title = this.translateService.instant('COMMON.TOPICS'))
        : (this.navItems[0].title = this.translateService.instant('COMMON.MAIN_TOPICS'))
      );
    }
  }

  private setSearchForm(): void {
    this.searchForm = this.fb.group({
      query: [],
    });
  }

  private handleQueryType(): void {
    this.searchForm.get('query').valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.ngOnDestroy$),
    ).subscribe((query: string) => this.search.next(query));
  }
}
