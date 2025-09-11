import express, { Request, Response } from 'express';
import forge from 'node-forge';
import { Role } from '../../generated/prisma';
declare const router: import("express-serve-static-core").Router;
export default router;
export declare const privateKey: forge.pki.rsa.PrivateKey;
export interface UserState {
    iss: string;
    sub: string;
    role: Role;
}
export declare function onLoggedIn(user: unknown, res: Response, req: Request, shouldkeepLoggedIn?: boolean): express.Response<any, Record<string, any>>;
export declare function clearAuthCookies(res: Response): express.Response<any, Record<string, any>>;
export declare function authMiddleware(req: any, res: Response, next: any): express.Response<any, Record<string, any>>;
