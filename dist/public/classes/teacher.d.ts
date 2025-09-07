import { Class_ } from "./mainPage.js";
export declare function loadTeacher(json: Class_): void;
export declare function displayStudent(id: number, classInfo: Class_): Promise<void>;
export declare function clamp(input: number, min: number, max: number): number;
export declare function map(current: number, in_min: number, in_max: number, out_min: number, out_max: number): number;
