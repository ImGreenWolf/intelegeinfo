declare const router: import("express-serve-static-core").Router;
export default router;
export declare function getFriends(id: any): Promise<({
    initiator: any;
    user: {
        id: number;
        username: string;
        firstName: string;
        lastName: string;
        userColor: string;
        picture: string;
    };
    id: number;
    initiatorId: number;
    receiverId: number;
    accepted: boolean;
    createdDate: Date;
} | {
    receiver: any;
    user: {
        id: number;
        username: string;
        firstName: string;
        lastName: string;
        userColor: string;
        picture: string;
    };
    id: number;
    initiatorId: number;
    receiverId: number;
    accepted: boolean;
    createdDate: Date;
})[]>;
