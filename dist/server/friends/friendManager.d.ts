declare const router: import("express-serve-static-core").Router;
export default router;
export declare function getFriends(id: any): Promise<({
    initiator: any;
    user: {
        username: string;
        firstName: string;
        lastName: string;
        id: number;
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
        username: string;
        firstName: string;
        lastName: string;
        id: number;
        userColor: string;
        picture: string;
    };
    id: number;
    initiatorId: number;
    receiverId: number;
    accepted: boolean;
    createdDate: Date;
})[]>;
