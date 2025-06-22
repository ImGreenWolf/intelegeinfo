export declare class IIWebRTC {
    pc: RTCPeerConnection | undefined;
    dc: RTCDataChannel | undefined;
    makingOffer: boolean;
    ignoreOffer: boolean;
    isSettingRemoteAnswerPending: boolean;
    polite: boolean;
    id: number;
    thistargetId: any;
    thisClientId: any;
    signaler: any;
    audio: HTMLAudioElement | undefined;
    onData: (data: string) => void;
    constructor(thistargetId: any, thisClientId: any, signaler: WebSocket, isHost: any, onConnection: (dataChannel: RTCDataChannel) => void);
    handleSignal({ type, targetId, callerId, description, candidate }: {
        type: any;
        targetId: any;
        callerId: any;
        description: any;
        candidate: any;
    }): Promise<void>;
    addMediaStream(selfVideo: any): Promise<void>;
    send(data: string): void;
    close(): void;
}
