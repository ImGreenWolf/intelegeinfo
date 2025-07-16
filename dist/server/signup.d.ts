import { Response } from 'express';
declare const router: import("express-serve-static-core").Router;
export declare function onSignedIn({ email, username, loginMethod, firstName, lastName }: {
    email: any;
    username: any;
    loginMethod: any;
    firstName: any;
    lastName: any;
}, res: Response, password: string, req: any): void;
export declare function prepareEncrPassForDB(password: string): string;
export default router;
