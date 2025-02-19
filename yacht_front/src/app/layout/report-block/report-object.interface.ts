import { ReportEntityTypeEnum } from '@api/schemas/report/report-entity-type.enum';

export interface IReportObject {
    type: ReportEntityTypeEnum;
    id: number;
}
