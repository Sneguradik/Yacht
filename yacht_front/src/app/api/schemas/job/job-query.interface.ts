import { LocaleEnum } from '../locale/locale.enum';
import { JobOrderEnum } from './job-order.enum';
import { PublicationStageEnum } from '../article/publication-stage.enum';

export interface IJobQuery {
    page?: number;
    company?: boolean;
    query?: string;
    order?: JobOrderEnum;
    locale?: LocaleEnum;
    asc?: boolean;
    stages?: PublicationStageEnum[];
    seen?: boolean;
    bookmark?: boolean;
}
