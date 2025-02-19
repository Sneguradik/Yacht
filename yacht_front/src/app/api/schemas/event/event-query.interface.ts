import { PublicationStageEnum } from '../article/publication-stage.enum';
import { EventFiltersEnum } from './event-filters.enum';

export interface IEventQuery {
    page?: number;
    company?: number;
    stages?: PublicationStageEnum[];
    types?: EventFiltersEnum[];
    seen?: boolean;
    bookmark?: boolean;
    before?: number;
    after?: number;
}
