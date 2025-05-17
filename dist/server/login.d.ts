import express, { Request, Response } from 'express';
declare const router: import("express-serve-static-core").Router;
export declare function onLoggedIn(user: unknown, res: Response, req: Request): void;
export declare function authMiddleware(req: any, res: Response, next: any): express.Response<any, Record<string, any>>;
export default router;
