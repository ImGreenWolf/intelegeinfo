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
export declare function getJWT(req: any): string;
export declare function getUserData<T extends Prisma.UserInclude>(id: number, include?: T): Promise<T extends Prisma.UserInclude ? Prisma.UserGetPayload<{
    include: T;
}> : UserNoPassword | undefined>;
export declare function getIdFromJWT(req: any): number;
export declare function addProject(id: number, data: any): Promise<{
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    emailValidated: boolean;
    userColor: string;
    picture: string;
    role: import("../../generated/prisma").$Enums.Role;
    createdAt: Date;
    activeAt: Date;
    password: string | null;
    authId: Prisma.JsonValue | null;
    loginMethod: string;
    occupationType: import("../../generated/prisma").$Enums.OccupationType;
    preferences: Prisma.JsonValue | null;
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
    Feedback: {
        body: string;
        id: number;
        createdAt: Date;
        userId: number | null;
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
        name: string;
        id: number;
        createdAt: Date;
        userId: number;
        fileUUID: string;
        metadata: Prisma.JsonValue | null;
    }[];
    solves: {
        type: import("../../generated/prisma").$Enums.SolveType;
        id: number;
        userId: number;
        problemid: number;
        sourceCode: string;
        uploadedAt: Date;
        score: number;
        time: number;
    }[];
    Guide: {
        name: string;
        description: string | null;
        category: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        authorId: number;
        positiveRatings: number;
        negativeRatings: number;
        content: string;
        visits: number;
    }[];
    Course: {
        description: string;
        id: number;
        email: string | null;
        createdAt: Date;
        userId: number;
        updatedAt: Date;
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
        message: string | null;
        id: number;
        firstName: string;
        lastName: string;
        createdAt: Date;
        userId: number | null;
        courseId: number;
        respondedAt: Date | null;
        response: boolean | null;
        contactInfo: Prisma.JsonValue;
    }[];
    Problem: {
        name: string;
        description: string | null;
        difficulty: import("../../generated/prisma").$Enums.Difficulty | null;
        tags: string[];
        category: string | null;
        requirement: Prisma.JsonValue | null;
        grade: number;
        id: number;
        createdAt: Date;
        sourceCode: string | null;
        updatedAt: Date;
        authorId: number;
        positiveRatings: number;
        negativeRatings: number;
        tests: Prisma.JsonValue[];
        averageTimeLimit: number;
        averageMemLimit: number;
    }[];
    JoinedClass: {
        userId: number;
        classId: number;
        joinDate: Date;
    }[];
    CreatedClasses: {
        name: string;
        description: string | null;
        color: string;
        id: number;
        createdAt: Date;
        creatorId: number;
    }[];
    Assigments: {
        description: string | null;
        id: number;
        createdAt: Date;
        classId: number;
        problemId: number | null;
        title: string;
        dueDate: Date | null;
    }[];
    SentMessages: {
        id: number;
        content: string;
        fromId: number;
        toId: number;
        sendDate: Date;
        relationId: number;
    }[];
    ReceivedMessages: {
        id: number;
        content: string;
        fromId: number;
        toId: number;
        sendDate: Date;
        relationId: number;
    }[];
    sentRequests: {
        id: number;
        initiatorId: number;
        receiverId: number;
        accepted: boolean;
        createdDate: Date;
    }[];
    receivedRequests: {
        id: number;
        initiatorId: number;
        receiverId: number;
        accepted: boolean;
        createdDate: Date;
    }[];
    Friends: {
        id: number;
        initiatorId: number;
        receiverId: number;
        accepted: boolean;
        createdDate: Date;
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
        JoinedClass: number;
        CreatedClasses: number;
        Assigments: number;
        SentMessages: number;
        ReceivedMessages: number;
        sentRequests: number;
        receivedRequests: number;
        Friends: number;
    };
} & {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    emailValidated: boolean;
    userColor: string;
    picture: string;
    role: import("../../generated/prisma").$Enums.Role;
    createdAt: Date;
    activeAt: Date;
    password: string | null;
    authId: Prisma.JsonValue | null;
    loginMethod: string;
    occupationType: import("../../generated/prisma").$Enums.OccupationType;
    preferences: Prisma.JsonValue | null;
})>;
