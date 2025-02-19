import { Component, ChangeDetectionStrategy, HostBinding, Input } from '@angular/core';

const DEFAULT_SIZE = 24;

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'svg[name]',
  template:
    '<svg:use attr.viewBox="0 0 {{width}} {{height}}" attr.width="{{width}}px" attr.height="{{height}}px" [attr.xlink:href]="\'/assets/icons.svg#\' + name"/>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SvgComponent {
  @HostBinding('attr.width') public hostWidth = `${ DEFAULT_SIZE }px`;
  @HostBinding('attr.height') public hostHeight = `${ DEFAULT_SIZE }px`;
  @HostBinding('attr.viewBox') public hostViewBox: string;

  @Input() public name = '';

  @Input('w') public set width(width: number) {
    this._width = width;
    this.hostWidth = `${width}px`;
  }
  public get width(): number {
    return this._width;
  }

  @Input('h') public set height(height: number) {
    this._height = height;
    this.hostHeight = `${height}px`;
  }
  public get height(): number {
    return this._height;
  }

  @Input() public set size(size: number) {
    this.width = size;
    this.height = size;
  }

  // tslint:disable-next-line:variable-name
  public _width: number = DEFAULT_SIZE;
  // tslint:disable-next-line:variable-name
  public _height: number = DEFAULT_SIZE;
}
