export interface IFacebookLoginResponse {
    status: string;
    authResponse: IFacebookAuthResponse;
}

interface IFacebookAuthResponse {
    accessToken: string;
    data_access_expiration_time: number;
    expiresIn: number;
    signedRequest: string;
    userID: string;
}
