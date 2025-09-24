import { EditorMode } from "./editor-modes";
import { EditorFile } from "./types";
import { Guide } from "../../generated/prisma";
import { UUID } from "crypto";
export declare function transpileCode(client: any, openFile: EditorFile, TargetEditorMode: typeof EditorMode): Promise<string>;
export declare function guideTTS(guide: Guide): Promise<{
    buffer: Buffer<ArrayBuffer>;
    speechFile: string;
    fileName: string;
}>;
export declare function aiEvaluateExplenation(sessionId: UUID, clientId: UUID, problemId: number, explenation: any): Promise<{
    review: string;
    scoreConclusion: {
        score: number;
        conclusion: string;
    };
}>;
export declare function autocompleteProblemDetails(client: any, openFile: EditorFile): Promise<{
    name: string;
    description: string | null;
    difficulty: import("../../generated/prisma").$Enums.Difficulty | null;
    tags: string[];
    category: string | null;
    requirement: import("../../generated/prisma/runtime/library").JsonValue | null;
    grade: number;
    id: number;
    createdAt: Date;
    updatedAt: Date;
    authorId: number;
    positiveRatings: number;
    negativeRatings: number;
    tests: import("../../generated/prisma/runtime/library").JsonValue[];
    averageTimeLimit: number;
    averageMemLimit: number;
    sourceCode: string | null;
}>;
