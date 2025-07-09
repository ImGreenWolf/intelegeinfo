import prisma from "./dbClient";
import { Prisma } from "../../generated/prisma";
export declare const router: import("express-serve-static-core").Router;
declare const userNoPassword: {
    omit: {
        password: true;
    };
};
export type UserNoPassword = Prisma.UserGetPayload<typeof userNoPassword>;
export declare function generateCode(): string;
export declare function getJWT(req: any): any;
export declare function getUserData(id: number): Promise<UserNoPassword>;
export declare function getIdFromJWT(req: any): number;
export declare function addProject(id: number, data: any): Promise<{
    id: number;
    createdAt: Date;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    emailValidated: boolean;
    userColor: string;
    picture: string;
    role: import("../../generated/prisma").$Enums.Role;
    password: string;
    loginMethod: string;
}>;
export declare function listAllProjects(userId: any): Promise<any>;
export declare function listProjects(userId: any, projects: any): Promise<any>;
export declare function getClientId(token: string): number;
export default prisma;
