import { PreviewSiteTypeEnum } from './preview-site-type.enum';

export interface IPreviewManagementCreate {
    title: string;
    siteName: string;
    url: string;
    description: string;
    type: PreviewSiteTypeEnum;
    card: string;
}
