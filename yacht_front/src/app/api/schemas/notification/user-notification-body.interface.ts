export interface IUserNotificationBody {
  id: number;
  info: {
    firstName: string;
    lastName: string;
    username?: string;
    picture?: string;
    company: {
      isCompany: boolean;
      confirmed?: boolean;
      name?: string;
    };
  };
}
