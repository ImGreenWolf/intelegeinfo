import { Response } from 'express';
import { onLoggedIn } from "./login";
declare const router: import("express-serve-static-core").Router;
export declare function onSignedIn({ email, username, loginMethod, firstName, lastName, profile }: {
    email: any;
    username: any;
    loginMethod: any;
    firstName: any;
    lastName: any;
    profile: any;
}, res: Response, password: string, req: any): Promise<{
    json: {
        message: any;
        redirect: any;
        email: any;
        id: any;
        loginMethod: any;
    };
    res: ReturnType<typeof onLoggedIn>;
}>;
export declare function prepareEncrPassForDB(password: string, decrypt?: boolean): string;
export default router;
