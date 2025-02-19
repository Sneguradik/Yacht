export interface ISubscribable {
  subscribers: {
    you?: boolean;
    count: number;
  };
}
