import { Response } from 'express';
import { UserNoPassword } from './usersManager';
declare const router: import("express-serve-static-core").Router;
export declare function onSignedIn({ email, username, loginMethod, firstName, lastName, profile }: {
    email: any;
    username: any;
    loginMethod: any;
    firstName: any;
    lastName: any;
    profile: any;
}, res: Response, password: string, req: any): Promise<{
    message: any;
    redirect: any;
    email: any;
    id: any;
    loginMethod: any;
    user: UserNoPassword;
}>;
export declare function prepareEncrPassForDB(password: string): string;
export default router;
