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
export declare function getUserData<T extends Prisma.UserInclude>(id: number, include?: T): Promise<T extends Prisma.UserInclude ? Prisma.UserGetPayload<{
    include: T;
}> : UserNoPassword | undefined>;
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
        JoinedClass: number;
        CreatedClasses: number;
        Assigments: number;
    };
    Problem: {
        id: number;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        authorId: number;
        positiveRatings: number;
        negativeRatings: number;
        requirement: Prisma.JsonValue | null;
        tests: Prisma.JsonValue[];
        averageTimeLimit: number;
        averageMemLimit: number;
        category: string | null;
        sourceCode: string | null;
        difficulty: import("../../generated/prisma").$Enums.Difficulty | null;
        tags: string[];
        grade: number;
    }[];
    CreatedClasses: {
        id: number;
        name: string;
        description: string | null;
        createdAt: Date;
        creatorId: number;
        color: string;
    }[];
    JoinedClass: {
        userId: number;
        classId: number;
        joinDate: Date;
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
        name: string;
        userId: number;
        createdAt: Date;
        metadata: Prisma.JsonValue | null;
        fileUUID: string;
    }[];
    solves: {
        id: number;
        userId: number;
        sourceCode: string;
        problemid: number;
        uploadedAt: Date;
        score: number;
        time: number;
    }[];
    Guide: {
        id: number;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        authorId: number;
        positiveRatings: number;
        negativeRatings: number;
        category: string | null;
        content: string;
        visits: number;
    }[];
    Course: {
        id: number;
        userId: number;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
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
        userId: number;
        createdAt: Date;
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
        userId: number | null;
        createdAt: Date;
        firstName: string;
        lastName: string;
        message: string | null;
        courseId: number;
        respondedAt: Date | null;
        response: boolean | null;
        contactInfo: Prisma.JsonValue;
    }[];
    Feedback: {
        id: number;
        userId: number | null;
        createdAt: Date;
        body: string;
    }[];
    Assigments: {
        id: number;
        classId: number;
        problemId: number | null;
        title: string;
        description: string | null;
        createdAt: Date;
        dueDate: Date | null;
    }[];
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
