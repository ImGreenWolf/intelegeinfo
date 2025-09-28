import { $Enums, Assignment, Problem, Solve } from "../../../generated/prisma";
import { JsonValue } from "../../../generated/prisma/runtime/library";
export default function main(): void;
export declare function dateDeltaToString(date: Date, capitalize?: boolean, language?: string): string | undefined;
export type Class_ = {
    Creator: {
        id: number;
        username: string;
        firstName: string;
        lastName: string;
        email: string;
        emailValidated: boolean;
        userColor: string;
        picture: string;
        role: $Enums.Role;
        createdAt: Date;
        activeAt: Date;
        authId: JsonValue | null;
        loginMethod: string;
        occupationType: $Enums.OccupationType;
    };
    Students: {
        userId: number;
        classId: number;
        User: {
            id: number;
            username: string;
            firstName: string;
            lastName: string;
            email: string;
            emailValidated: boolean;
            userColor: string;
            picture: string;
            role: $Enums.Role;
            createdAt: Date;
            activeAt: Date;
            password: string | null;
            authId: JsonValue | null;
            loginMethod: string;
            occupationType: $Enums.OccupationType;
            solves: Solve[];
        };
    }[];
    Assignments: {
        id: number;
        description: string | null;
        createdAt: Date;
        classId: number;
        problemId: number | null;
        title: string;
        dueDate: Date | null;
        Problem: any;
    }[];
    _count: {
        Creator: number;
        Students: number;
        Assignments: number;
    };
} & {
    mySolves: {
        id: number;
        userId: number;
        problemid: number;
        sourceCode: string;
        uploadedAt: Date;
        score: number;
        time: number;
    }[];
} & {
    id: number;
    createdAt: Date;
    name: string;
    description: string;
    creatorId: number;
    isOwner: boolean;
    color: string;
    classPath: string;
    myAssignments: (Assignment & {
        Problem: Problem;
    })[];
};
