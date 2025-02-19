export interface IReportNotificationBody {
  id: number;
  url: string;
  message: string | {};
  owner: {
    id: number;
    info: {
      company: {
        isCompany: boolean;
        confirmed?: boolean;
        name?: string;
      };
      firstName: string;
      lastName: string;
      picture?: string;
      username?: string;
      bio?: string;
    };
  };
}
