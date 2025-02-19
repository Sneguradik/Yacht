import { IUserView } from './user-view.interface';
import { IUserContacts } from './user-contacts.interface';

export interface IUserViewFull extends IUserView {
  profile: {
    cover?: string;
    fullDescription?: string;
  };
  contacts: IUserContacts;
  roles?: string[];
  privateEmail?: string;
}
