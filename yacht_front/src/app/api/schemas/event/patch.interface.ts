import { EventCurrencyEnum } from '@api/schemas/event/event-currency.enum';
import { EventTypeEnum } from '@api/schemas/event/event-type.enum';

export interface IEventPatch {
  info?: Partial<{
    name: string;
    price: string;
    currency: EventCurrencyEnum;
    city: string;
    type: EventTypeEnum;
    date: number;
    announcement: string;
  }>;
  body?: Partial<{
    address: string;
    registrationLink: string;
  }>;
}
