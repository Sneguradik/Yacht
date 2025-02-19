import { IDefaultFileResponce } from './default-file-response.interface';

export interface IUploadAdapter {
    upload: () => Promise<IDefaultFileResponce>;
    abort: () => void;
}
