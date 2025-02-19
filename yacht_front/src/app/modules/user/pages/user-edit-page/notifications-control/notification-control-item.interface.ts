import { NotSettingEnum } from '@api/schemas/notification/not-setting.enum';

export interface INotificationControlItem {
    id: number;
    title: string;
    type?: NotSettingEnum;
    access?: boolean;
    active: boolean;
    disabled: boolean;
}
