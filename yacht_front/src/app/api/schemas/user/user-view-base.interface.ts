import { IObject } from '../object/object.interface';

export interface IUserViewBase extends IObject {
  info: {
    firstName: string;
    lastName: string;
    picture?: string;
    username?: string;
    company: {
      isCompany: boolean;
      confirmed?: boolean;
      name?: string;
    };
    bio?: string;
  };
}
