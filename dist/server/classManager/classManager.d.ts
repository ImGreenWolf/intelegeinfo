declare const router: import("express-serve-static-core").Router;
export default router;
import { Assignment } from '../../../generated/prisma';
declare global {
    namespace Express {
        interface Request {
            class?: {
                Students: {
                    classId: number;
                    userId: number;
                }[];
                Assignments: {
                    id: number;
                    description: string;
                    createdAt: Date;
                    title: string;
                    classId: number;
                    problemId: number;
                }[];
                _count: {
                    Creator: number;
                    Students: number;
                    Assignments: number;
                };
            } & {
                name: string;
                id: number;
                description: string;
                creatorId: number;
                createdAt: Date;
            };
            classId: number;
            assignment: Assignment;
        }
    }
}
