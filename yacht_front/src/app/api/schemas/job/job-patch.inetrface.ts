import { JobCurrencyEnum } from './job-currency.enum';
import { JobTypeEnum } from './job-type.enum';
import { JobPlaceEnum } from './job-place.enum';

export interface IJobPatch {
    body?: Partial<{
        tasks: string;
        workConditions: string;
        requirements: string;
        image?: string;
    }>;
    info?: Partial<{
        name: string;
        minSalary?: string;
        maxSalary?: string;
        currency: JobCurrencyEnum;
        type: JobTypeEnum;
        place: JobPlaceEnum;
        city?: string;
        recruiterName?: string;
        email?: string;
    }>;
}
