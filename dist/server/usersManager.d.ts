import prisma from "./dbClient";
import { Prisma } from "../../generated/prisma";
import nodemailer from "nodemailer";
import { UserState } from "./login";
import multer from 'multer';
import { EditorSession } from "./types";
export declare let transporter: nodemailer.Transporter;
export declare const router: import("express-serve-static-core").Router;
declare const userNoPassword: {
    omit: {
        password: true;
        authId: true;
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
export declare function addProject(userId: number, projId: any, session: EditorSession, name: string): Promise<{
    id: number;
    name: string | null;
    creatorId: number;
    updatedAt: Date;
    projectId: number;
    savedAt: Date;
    folderId: number | null;
}>;
export declare function shareProject(userId: number, projId: any, session: EditorSession): Promise<{
    id: number;
    creatorId: number | null;
    projectId: number;
    openedAt: Date;
    sharedAt: Date;
}>;
export declare function listAllProjects(userId: any): Promise<[({
    Project: {
        id: number;
        name: string | null;
        userId: number | null;
        createdAt: Date;
        fileUUID: string | null;
        metadata: Prisma.JsonValue | null;
    };
} & {
    id: number;
    name: string | null;
    creatorId: number;
    updatedAt: Date;
    projectId: number;
    savedAt: Date;
    folderId: number | null;
})[], ({
    _count: {
        User: number;
        Projects: number;
        ParentFolder: number;
        ChildFolders: number;
    };
} & {
    name: string;
    userId: number;
    createdAt: Date;
    folderId: number;
    parentFolderId: number | null;
})[]]>;
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
        SavedProject: number;
        SharedProject: number;
        Folders: number;
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
    solves: {
        id: number;
        userId: number;
        sourceCode: string;
        problemid: number;
        uploadedAt: Date;
        score: number;
        type: import("../../generated/prisma").$Enums.SolveType;
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
        courseId: number;
        respondedAt: Date | null;
        response: boolean | null;
        contactInfo: Prisma.JsonValue;
        message: string | null;
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
    SavedProject: {
        id: number;
        name: string | null;
        creatorId: number;
        updatedAt: Date;
        projectId: number;
        savedAt: Date;
        folderId: number | null;
    }[];
    SharedProject: {
        id: number;
        creatorId: number | null;
        projectId: number;
        openedAt: Date;
        sharedAt: Date;
    }[];
    Folders: {
        name: string;
        userId: number;
        createdAt: Date;
        folderId: number;
        parentFolderId: number | null;
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
    preferences: Prisma.JsonValue | null;
})>;
