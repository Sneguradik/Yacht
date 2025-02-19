export interface IVkLoginResponse {
    session?: IVkSession;
    status: string;
}

interface IVkSession {
    expire: number;
    mid: string;
    secret: string;
    sid: string;
    sig: string;
    user: IVkUser;
}

interface IVkUser {
    domain: string;
    first_name: string;
    href: string;
    id: string;
    last_name: string;
    nickname: string;
}
