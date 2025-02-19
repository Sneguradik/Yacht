export interface IShortPostNotificationBody {
  id: number;
  info: {
    title?: string;
    topics?: ITopics[];
  };
}

interface ITopics {
  id: number;
  name: string;
}
