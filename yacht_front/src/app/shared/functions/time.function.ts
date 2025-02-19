import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthNamesRu = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

@Injectable()
export class TimeFunctions {
  constructor(private readonly translateService: TranslateService) { }

  public timestampToStringRange(timestamp: number): string {
    const date: Date = new Date(timestamp);
    const monthNames = this.translateService?.currentLang === 'ru' ? monthNamesRu : monthNamesEn;
    return `${ date.getDate() } ${ monthNames[date.getMonth()] } ${ this.timeToString(timestamp) }`;
  }

  public timestampToStringNews(timestamp: number): string {
    const date: Date = new Date(timestamp);
    const today: Date = new Date();
    const monthNames = this.translateService?.currentLang === 'ru' ? monthNamesRu : monthNamesEn;
    return today.getDate() - date.getDate() <= 2 && date.getMonth() === today.getMonth()
      ? `${ date.getDate() } ${ monthNames[date.getMonth()] } ${ this.timeToString(timestamp) }`
      : `${ date.getDate() } ${ monthNames[date.getMonth()] }`;
  }

  public timestampToString(timestamp: number): string {
    const date: Date = new Date(timestamp);
    const monthNames = this.translateService?.currentLang === 'ru' ? monthNamesRu : monthNamesEn;
    return `${ date.getDate() } ${ monthNames[date.getMonth()] } ${ this.translateService?.currentLang === 'ru' ? 'в' : 'in' } ${ this.timeToString(timestamp) }`;
  }

  public timeToString(timestamp: number): string {
    const date = new Date(timestamp);
    return `${ (date
      .getHours()
      .toString() as any)
      .padStart(2, '0') }:${ (date
      .getMinutes()
      .toString() as any)
      .padStart(2, '0') }`;
  }
}
