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
    id: number;
    createdAt: Date;
    name: string;
    updatedAt: Date;
    authorId: number;
    positiveRatings: number;
    negativeRatings: number;
    description: string | null;
    category: string | null;
    requirement: import("../../generated/prisma/runtime/library").JsonValue | null;
    tests: import("../../generated/prisma/runtime/library").JsonValue[];
    averageTimeLimit: number;
    averageMemLimit: number;
    sourceCode: string | null;
    difficulty: import("../../generated/prisma").$Enums.Difficulty | null;
    tags: string[];
    grade: number;
}>;
