import prisma from "./src/routes/dbClient";
import { User } from "../generated/prisma";
export declare const router: import("express-serve-static-core").Router;
export declare function getJWT(req: any): any;
export declare function getUserData(id: number): Promise<User | undefined>;
export declare function getIdFromJWT(req: any): number;
export declare function addProject(id: number, data: any): Promise<User>;
export declare function getClientId(token: string): number;
export default prisma;
