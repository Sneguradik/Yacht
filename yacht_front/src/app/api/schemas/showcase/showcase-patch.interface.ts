import { IShowcaseView } from './showcase-view.interface';

export interface IShowcasePatch {
  info?: Partial<{
    duration?: number;
    subtitle: string;
    title: string;
    options: Partial<IShowcaseView['info']['options']>;
    url?: string;
  }>;
}

