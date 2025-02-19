import { PreviewSiteTypeEnum } from './preview-site-type.enum';

export interface IPreviewManagementUpdate {
    title: string;
    siteName: string;
    description: string;
    type: PreviewSiteTypeEnum;
    card: string;
}
