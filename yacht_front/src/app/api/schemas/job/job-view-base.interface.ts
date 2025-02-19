import { IObject } from '../object/object.interface';
import { JobCurrencyEnum } from './job-currency.enum';
import { JobPlaceEnum } from './job-place.enum';
import { JobTypeEnum } from './job-type.enum';
import { PublicationStageEnum } from '../article/publication-stage.enum';

export interface IJobViewBase extends IObject {
    info: {
        publicationStage: PublicationStageEnum;
        publishedAt?: number;
        name: string;
        minSalary?: string;
        maxSalary?: string;
        currency: JobCurrencyEnum;
        type: JobTypeEnum;
        place: JobPlaceEnum;
        city?: string;
    };
    company: {
        meta: {
            id: number;
        };
    };
}
