import express, { Request, Response } from 'express';
import forge from 'node-forge';
declare const router: import("express-serve-static-core").Router;
export default router;
export declare const privateKey: forge.pki.rsa.PrivateKey;
export declare function onLoggedIn(user: unknown, res: Response, req: Request, shouldkeepLoggedIn?: boolean): void;
export declare function authMiddleware(req: any, res: Response, next: any): express.Response<any, Record<string, any>>;
