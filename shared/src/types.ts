export enum WebSocketMessageType {
    Handshake = "handshake",
    Error = "error",
    Output = "output",
    End = "end",
    Console = "console",
    Chat = "chat",
    ConsoleTyping = 'consolekeepalive',
    CodeChange = "codeChange",
    CodeSelection = "codeSelection",
    ColabData = "colabData",
    Heartbeat = "heartbeat",
    FileManagement = "FileManagement",
    CompileResult = "CompileResult",
    ExecuteStatus =  "executestatus",
    MouseUpdate = "MouseUpdate",
    WebCam = 'webcam',
    Canvas = 'canvas',
    RTC = 'rtc',
    Utilities = 'utils',
    Debug = 'debug'
}

export enum ConsoleMessageType {
    UserChat = 'chat',
    Error = 'error',
    Info = 'information',
    Debug = 'debug',
    SessionInfo = "session",
    Output = 'output',
    DebugProgram  = "debugProgram",
    Notification = 'notification',
    Console = 'console'
}

export const sessionCookieName = 'editor_session_id'

export class WSMessage {
  type: WebSocketMessageType;
  data: Record<string, any>;
  id: number;
  // session: EditorSession;
  constructor(
    type: WebSocketMessageType,
    data: Record<string, any>,
    msgMap: any,
    id: number,
    ws:WebSocket,
    onReceive: (data: Record<string, any>) => void
  ) {
    this.type = type;
    this.data = data;
    this.id = id;

    // this.session = session;
    // this.onReceiveMsg(data)
    // {
    //     this.onReceive(data)
    // }
    this.onReceiveCallback = onReceive;
    this.sendMessage(data, id, ws);
  }

  public onReceiveCallback: (data: Record<string, any>) => void;

  public onReceive(data: Record<string, any>) {
    this.onReceiveCallback(data);
    // msgMap.delete(this.id);
  }
  public sendMessage(data: Record<string, any>, msgId: number, ws: WebSocket) {
    ws.send(JSON.stringify({ data, msgId: msgId }));
    console.log("sent message");
    // msgMap.set(msgId, this);
  }
}



export enum FileManagementCommands {
    Create = "create",
    Delete = "delete",
    List = "list",
    Rename = "rename",
    Open = "open",
}


