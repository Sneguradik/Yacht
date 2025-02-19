import { PreviewSiteTypeEnum } from './preview-site-type.enum';

export interface IPreviewManagementView {
    id: number;
    title: string;
    siteName: string;
    url: string;
    image: string;
    description: string;
    type: PreviewSiteTypeEnum;
    card: string;
    updatedAt: string;
}
