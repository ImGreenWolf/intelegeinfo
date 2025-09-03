import prisma from "./dbClient";
import { Prisma } from "../../generated/prisma";
import nodemailer from "nodemailer";
import { UserState } from "./login";
import multer from 'multer';
export declare let transporter: nodemailer.Transporter;
export declare const router: import("express-serve-static-core").Router;
declare const userNoPassword: {
    omit: {
        password: true;
    };
};
export declare const storage: multer.StorageEngine;
export declare const upload: multer.Multer;
export type UserNoPassword = Prisma.UserGetPayload<typeof userNoPassword>;
export declare function generateCode(): string;
export declare function getJWT(req: any): any;
export declare function getUserData(id: number, include?: Prisma.UserInclude): Promise<UserNoPassword>;
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
    activeAt: Date;
    password: string | null;
    authId: Prisma.JsonValue | null;
    loginMethod: string;
    occupationType: import("../../generated/prisma").$Enums.OccupationType;
}>;
export declare function listAllProjects(userId: any): Promise<any[]>;
export declare function getClientJWTValue(token: string): UserState;
export declare function getClientId(token: string): number | undefined;
export declare function createUploadFromFile(fileReq: any, userId: number): {
    create: Prisma.UploadCreateInput;
};
export declare function uploadFromFileData(fileReq: any, userId: any): Prisma.UploadCreateInput | undefined;
export default prisma;
export declare function activeAtComponent(): {
    activeAt: Date;
};
export declare function updateActiveAtForUser(userId: number, include?: Prisma.UserInclude): Promise<false | ({
    Guide: {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        authorId: number;
        positiveRatings: number;
        negativeRatings: number;
        content: string;
        description: string | null;
        category: string | null;
        visits: number;
    }[];
    pictureUpload: {
        id: number;
        createdAt: Date;
        path: string;
        originalName: string;
        size: number;
        UserId: number | null;
    };
    projects: {
        id: number;
        metadata: Prisma.JsonValue | null;
        name: string;
        createdAt: Date;
        fileUUID: string;
        userId: number;
    }[];
    solves: {
        id: number;
        userId: number;
        problemid: number;
        sourceCode: string;
        uploadedAt: Date;
        score: number;
        time: number;
    }[];
    Course: {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        email: string | null;
        userId: number;
        experience: string;
        price: number;
        courseLength: number;
        summary: string;
        summaryPath: string | null;
        phone: string | null;
        external: Prisma.JsonValue | null;
        views: number;
    };
    Review: {
        id: number;
        createdAt: Date;
        userId: number;
        courseId: number;
        rating: number;
        motive: string | null;
    }[];
    Upload: {
        id: number;
        createdAt: Date;
        path: string;
        originalName: string;
        size: number;
        UserId: number | null;
    }[];
    Inquiry: {
        id: number;
        createdAt: Date;
        firstName: string;
        lastName: string;
        userId: number | null;
        courseId: number;
        respondedAt: Date | null;
        response: boolean | null;
        contactInfo: Prisma.JsonValue;
        message: string | null;
    }[];
    Problem: {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        authorId: number;
        positiveRatings: number;
        negativeRatings: number;
        description: string | null;
        category: string | null;
        sourceCode: string | null;
        requirement: Prisma.JsonValue | null;
        tests: Prisma.JsonValue[];
        averageTimeLimit: number;
        averageMemLimit: number;
        difficulty: import("../../generated/prisma").$Enums.Difficulty | null;
        tags: string[];
        grade: number;
    }[];
    Feedback: {
        id: number;
        createdAt: Date;
        userId: number | null;
        body: string;
    }[];
    _count: {
        pictureUpload: number;
        projects: number;
        solves: number;
        Guide: number;
        Course: number;
        Review: number;
        Upload: number;
        Inquiry: number;
        Problem: number;
        Feedback: number;
    };
} & {
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
    activeAt: Date;
    password: string | null;
    authId: Prisma.JsonValue | null;
    loginMethod: string;
    occupationType: import("../../generated/prisma").$Enums.OccupationType;
})>;
