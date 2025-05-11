import { User } from "../../generated/prisma";
declare const router: import("express-serve-static-core").Router;
export default router;
export declare function parseUserInfoInFile(userId: any, fileSrc: string, params?: User | any): Promise<any>;
