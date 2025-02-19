import { IJobView } from './job-view.interface';


export interface IJobViewFull extends IJobView {
  info: IJobView['info'] & {
    recruiterName?: string;
    email?: string;
  };
  body: {
    image?: string;
    tasks: string;
    workConditions: string;
    requirements: string;
  };
}
