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
    updatedAt: Date;
    creatorId: number;
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
        createdAt: Date;
        name: string | null;
        userId: number | null;
        metadata: Prisma.JsonValue | null;
        fileUUID: string | null;
    };
} & {
    id: number;
    name: string | null;
    updatedAt: Date;
    creatorId: number;
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
    createdAt: Date;
    name: string;
    userId: number;
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
    pictureUpload: {
        id: number;
        createdAt: Date;
        path: string;
        originalName: string;
        size: number;
        UserId: number | null;
    };
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
        id: number;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        authorId: number;
        positiveRatings: number;
        negativeRatings: number;
        content: string;
        description: string | null;
        category: string | null;
        visits: number;
    }[];
    Course: {
        email: string | null;
        id: number;
        createdAt: Date;
        userId: number;
        updatedAt: Date;
        description: string;
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
        firstName: string;
        lastName: string;
        id: number;
        createdAt: Date;
        message: string | null;
        userId: number | null;
        courseId: number;
        respondedAt: Date | null;
        response: boolean | null;
        contactInfo: Prisma.JsonValue;
    }[];
    Problem: {
        id: number;
        createdAt: Date;
        name: string;
        sourceCode: string | null;
        updatedAt: Date;
        authorId: number;
        positiveRatings: number;
        negativeRatings: number;
        description: string | null;
        category: string | null;
        requirement: Prisma.JsonValue | null;
        tests: Prisma.JsonValue[];
        averageTimeLimit: number;
        averageMemLimit: number;
        difficulty: import("../../generated/prisma").$Enums.Difficulty | null;
        tags: string[];
        grade: number;
    }[];
    Feedback: {
        body: string;
        id: number;
        createdAt: Date;
        userId: number | null;
    }[];
    JoinedClass: {
        userId: number;
        classId: number;
        joinDate: Date;
    }[];
    CreatedClasses: {
        color: string;
        id: number;
        createdAt: Date;
        name: string;
        description: string | null;
        creatorId: number;
    }[];
    Assigments: {
        id: number;
        createdAt: Date;
        description: string | null;
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
    SavedProject: {
        id: number;
        name: string | null;
        updatedAt: Date;
        creatorId: number;
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
        createdAt: Date;
        name: string;
        userId: number;
        folderId: number;
        parentFolderId: number | null;
    }[];
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
} & {
    email: string;
    username: string;
    loginMethod: string;
    firstName: string;
    lastName: string;
    id: number;
    emailValidated: boolean;
    userColor: string;
    picture: string;
    role: import("../../generated/prisma").$Enums.Role;
    createdAt: Date;
    activeAt: Date;
    password: string | null;
    authId: Prisma.JsonValue | null;
    occupationType: import("../../generated/prisma").$Enums.OccupationType;
    preferences: Prisma.JsonValue | null;
})>;
