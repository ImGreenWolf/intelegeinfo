

// const WSUrl = (window.location.protocol == "https:" ? "wss://" : "ws://") + window.location.hostname  + ":" + window.location.port + "/rtc"

import { createNode } from "./components";


// //@ts-ignore
// const signaler = new WebSocket(WSUrl)


// const pc = new RTCPeerConnection(configuration);
// const dc = pc.createDataChannel('data')

// // dc.onmessage = (event) => {
// //   console.log(`received: ${event.data}`);
// // };

// // dc.onopen = () => {
// //   console.log("datachannel open");
// // };

// // dc.onclose = () => {
// //   console.log("datachannel close");
// // };


// const constraints = { audio: true, video: true };
// const selfVideo = document.querySelector("video.self-view") as HTMLVideoElement;
// const remoteVideo = document.querySelector("video.remote-view") as HTMLVideoElement;

// start()

// async function start() {
//   try {
//     const stream = await navigator.mediaDevices.getUserMedia(constraints);

//     for (const track of stream.getTracks()) {
//       pc.addTrack(track, stream);
//     }
//     selfVideo!.srcObject = stream;
//   } catch (err) {
//     console.error(err);
//   }
// }


// pc.ontrack = ({ track, streams }) => {
//     console.log('added video track')
//   track.onunmute = () => {
//     if (remoteVideo.srcObject) {
//       return;
//     }
//     remoteVideo.srcObject = streams[0];
    

//   };
// };



// let makingOffer = false;

// pc.onnegotiationneeded = async () => {
//   try {
//     makingOffer = true;
//     await pc.setLocalDescription();
//     signaler.send(JSON.stringify({ description: pc.localDescription }));
//     console.log('finished negotiating')

//   } catch (err) {
//     console.error(err);
//   } finally {
//     makingOffer = false;
//   }
// };

// pc.onicecandidate = ({ candidate }) => signaler.send(JSON.stringify({ candidate }));

// pc.ondatachannel = (ev) => {
//     const dataChannel = ev.channel
//     console.log('added data channel')

//     document.onmousemove = (ev) => {
//         dc.send(JSON.stringify({posx: ev.x, posy: ev.y}))
//     }

//     const elem = document.createElement('div')
//     elem.style.width = "50px"
//     elem.style.height = "50px"
//     elem.style.backgroundColor = 'black';
//     elem.style.position = 'fixed'
//     document.body.appendChild(elem)
//     dataChannel.onmessage = ev => {
//         const {posx,posy} = JSON.parse(ev.data)
//         elem.style.left = posx + 'px'
//         elem.style.top = posy + 'px'
//     }
// }


// let ignoreOffer = false;
// let isSettingRemoteAnswerPending = false;
// const polite = true;

// signaler.onmessage = async (ev) => {
//   try {
//     const data = ev.data.toString()
//     const  { description, candidate } = JSON.parse(data)

//     if (description) {
//       const readyForOffer =
//         !makingOffer &&
//         (pc.signalingState === "stable" || isSettingRemoteAnswerPending);
//       const offerCollision = description.type === "offer" && !readyForOffer;

//       ignoreOffer = !polite && offerCollision;
//       if (ignoreOffer) {
//         return;
//       }
//       isSettingRemoteAnswerPending = description.type === "answer";
//         console.log('setting remote description')

//       await pc.setRemoteDescription(description);
//       isSettingRemoteAnswerPending = false;
//       if (description.type === "offer") {
//         console.log('added offer')

//         await pc.setLocalDescription();
//         signaler.send(JSON.stringify({ description: pc.localDescription })); // create awnser
//       }
//     } else if (candidate) {
//       try {
//         console.log('added ICE candidate: ',candidate)
//         await pc.addIceCandidate(candidate);
//       } catch (err) {
//         if (!ignoreOffer) {
//           throw err;
//         }
//       }
//     }
//   } catch (err) {
//     console.error(err);
//   }
// };





export class IIWebRTC
{
    pc: RTCPeerConnection | undefined;
    dc: RTCDataChannel | undefined;
    makingOffer = false;
    ignoreOffer = false;
    isSettingRemoteAnswerPending = false;
    polite = true;
    id = Math.floor(Math.random()*100);
    thistargetId
    thisClientId
    signaler
    audio: HTMLAudioElement | undefined
    onData: (data: string) => void = (data) => console.log(data)

    constructor(thistargetId,thisClientId, signaler: WebSocket, isHost, onConnection: (dataChannel: RTCDataChannel) => void)
    {
        var configuration: RTCConfiguration = {
            iceServers : [ 
               { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun.l.google.com:5349" },
                { urls: "stun:stun1.l.google.com:3478" },
                { urls: "stun:stun1.l.google.com:5349" },
                { urls: "stun:stun2.l.google.com:19302" },
                { urls: "stun:stun2.l.google.com:5349" },
                { urls: "stun:stun3.l.google.com:3478" },
                { urls: "stun:stun3.l.google.com:5349" },
                { urls: "stun:stun4.l.google.com:19302" },
                { urls: "stun:stun4.l.google.com:5349" }
             ]
        };

        navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
            if(!this.audio)
            {
                this.audio = createNode('audio');
                this.audio.autoplay = true;
                document.body.appendChild(this.audio)
                
                for(const track of stream.getTracks())
                this.pc?.addTrack(track, stream)
            }
        })
        

          
        // this.polite = !isHost
        // const WSUrl = (window.location.protocol == "https:" ? "wss://" : "ws://") + window.location.hostname  + ":" + window.location.port + "/rtc?session="+sessionId
        // const signaler = new WebSocket(WSUrl) // 

        if(!signaler.OPEN)
            return


        this.pc! = new RTCPeerConnection(configuration); // create local peer connection
        // console.log(this.id,'is caller : ', isHost, "target: ",thistargetId)
       
        this.dc = this.pc!.createDataChannel('data') // data channel for communication created locally on host

        console.log(this.id, "is host:", isHost, "caller:", thisClientId, "callee:", thistargetId)
        this.pc!.ontrack = ({ track, streams }) => {
        track.onunmute = () => {
            if(!this.audio)
                return
            if (this.audio!.srcObject) 
                return;
            this.audio!.srcObject! = streams[0];
                    
        };
        };
            //ready to negotiate step 1
        this.pc!.onnegotiationneeded = async () => {
            try {
                this.makingOffer = true;
                const offer = await this.pc?.createOffer() // 1
                await this.pc!.setLocalDescription(offer); // 2
                signaler.send(JSON.stringify({type: "rtc", targetId: thistargetId, description: offer })); //this.pc!.localDescription //3
                // console.log(this.id,'making offer. ',"target: ",thistargetId)
                console.log(this.id,'negotiation ended')
            } catch (err) {
                console.error(this.id,err);
            } finally {
                this.makingOffer = false;
            }
        };



        

            this.pc!.onicecandidate = ({ candidate }) => signaler.send(JSON.stringify({type: "rtc",  targetId: thistargetId,candidate }));

            this.pc!.ondatachannel = (ev) => {
                const newDC = ev.channel
                if(!this.dc)
                    this.dc = newDC
                if(onConnection)
                    onConnection(newDC)
                newDC.addEventListener('message', ev => {
                    this.onData(ev.data)
                })
            }

            // this.pc!.oniceconnectionstatechange = () => {
            // if (this.pc!.iceConnectionState === "failed") {
            //     this.pc!.setConfiguration(configuration);
            //     this.pc!.restartIce();
            // }
            // };

           this.thisClientId = thisClientId
            this.thistargetId = thistargetId
            this.signaler = signaler
    }   

    public async handleSignal({type, targetId, callerId, description, candidate }) {
 
            try {
                // const data = description.toString()
                // const  {type, targetId, callerId, description, candidate } = JSON.parse(data)
                const isForUs = targetId === this.thisClientId || callerId === this.thistargetId;
                if(type != 'rtc' || !isForUs)
                    return;
                if (description) {
                    const readyForOffer =
                        !this.makingOffer &&
                        (this.pc!.signalingState === "stable" || this.isSettingRemoteAnswerPending);

                    const offerCollision = description.type === "offer" && !readyForOffer;

                    console.log(this.id,readyForOffer, offerCollision)

                    this.ignoreOffer = !this.polite && offerCollision;
                    if (this.ignoreOffer) {
                        return;
                    }
                    this.isSettingRemoteAnswerPending = description.type === "answer";
                    console.log(this.id,'setting remote description', description.type)

                    await this.pc!.setRemoteDescription(new RTCSessionDescription(description)); // step 3: describe the remote connection
                    this.isSettingRemoteAnswerPending = false;
                    if (description.type === "offer") {
                        console.log(this.id,'awnsered offer')

                        
                        const awnser = await this.pc?.createAnswer()
                        await this.pc!.setLocalDescription(awnser);
                        this.signaler.send(JSON.stringify({type: "rtc", targetId: this.thistargetId, description: this.pc!.localDescription })) // this.pc!.localDescription })); // create awnser
                    }
                } else if (candidate) {
                    try {
                        // console.log('added ICE candidate: ',candidate)
                        await this.pc!.addIceCandidate(new RTCIceCandidate(candidate));
                    } catch (err) {
                        if (!this.ignoreOffer) {
                        throw err;
                        }
                    }
                }
            } catch (err) {
                console.error(this.id,err);
            }
        }

    public async addMediaStream(selfVideo)
    {
        try {
            const constraints = { audio: true, video: true };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            for (const track of stream.getTracks()) {
            this.pc!.addTrack(track, stream);
            }
            selfVideo!.srcObject = stream;
        } catch (err) {
            console.error(err);
        }
    }

    public send(data: string)
    {
        if(this.dc)
            if(this.pc!.connectionState == 'connected' && this.dc.readyState == 'open')
                this.dc.send(data)
            else
            throw "Connection is " + this.pc!.connectionState +". And datachannel is " + this.dc.readyState
    }

    public close()
    {
        this.pc?.close()
    }
}




function webrtc () 
{
let connectButton: HTMLButtonElement | null = null;
let disconnectButton: HTMLButtonElement | null = null;
let sendButton: HTMLButtonElement | null = null;
let messageInputBox: HTMLTextAreaElement | null = null;
let receiveBox: HTMLDivElement | null = null;

let localConnection: RTCPeerConnection | null = null; // RTCPeerConnection for our "local" connection
let remoteConnection:  RTCPeerConnection | null  = null; // RTCPeerConnection for the "remote"

let sendChannel: RTCDataChannel | null = null; // RTCDataChannel for the local (sender)
let receiveChannel: RTCDataChannel | null = null; // RTCDataChannel for the remote (receiver)


function startup() {
  connectButton = document.getElementById("connectButton") as HTMLButtonElement;
  disconnectButton = document.getElementById("disconnectButton")as HTMLButtonElement;
  sendButton = document.getElementById("sendButton")as HTMLButtonElement;
  messageInputBox = document.getElementById("message") as HTMLTextAreaElement;
  receiveBox = document.getElementById("receive-box") as HTMLDivElement;

  // Set event listeners for user interface widgets

  connectButton.addEventListener("click", connectPeers, false);
  disconnectButton.addEventListener("click", disconnectPeers, false);
  sendButton.addEventListener("click", sendMessage, false);
}

function connectPeers()
{
    // LOCAL CONNECTION
    localConnection = new RTCPeerConnection();

    sendChannel = localConnection.createDataChannel("sendChannel")!;
    sendChannel.onopen = handleSendChannelStatusChange;
    sendChannel.onclose = handleSendChannelStatusChange;

    // REMOTE CONNECTION
    remoteConnection = new RTCPeerConnection();
    remoteConnection.ondatachannel = receiveChannelCallback; 


        localConnection.onicecandidate = (e) =>
    !e.candidate ||
    remoteConnection!.addIceCandidate(e.candidate).catch(handleAddCandidateError);

    remoteConnection.onicecandidate = (e) =>
    !e.candidate ||
    localConnection!.addIceCandidate(e.candidate).catch(handleAddCandidateError);



    localConnection
    .createOffer()
    .then((offer) => localConnection!.setLocalDescription(offer))
    .then(() =>
        remoteConnection!.setRemoteDescription(localConnection!.localDescription!),
    )
    .then(() => remoteConnection!.createAnswer())
    .then((answer) => remoteConnection!.setLocalDescription(answer))
    .then(() =>
        localConnection!.setRemoteDescription(remoteConnection!.localDescription!),
    )
    .catch(handleCreateDescriptionError);
}


function handleCreateDescriptionError(error: { toString: () => any; }) {
  console.log(`Unable to create an offer: ${error.toString()}`);
}

function handleLocalAddCandidateSuccess() {
  connectButton!.disabled = true;
}

function handleRemoteAddCandidateSuccess() {
  disconnectButton!.disabled = false;
}

function handleAddCandidateError() {
  console.log("Oh noes! addICECandidate failed!");
}


function receiveChannelCallback(event: { channel: RTCDataChannel | null; }) {
  receiveChannel = event.channel;
  receiveChannel!.onmessage = handleReceiveMessage;
  receiveChannel!.onopen = handleReceiveChannelStatusChange;
  receiveChannel!.onclose = handleReceiveChannelStatusChange;
}

function handleSendChannelStatusChange(event: any) {
  if (sendChannel) {
    const state = sendChannel.readyState;

    if (state === "open") {
      messageInputBox!.disabled = false;
      messageInputBox!.focus();
      sendButton!.disabled = false;
      disconnectButton!.disabled = false;
      connectButton!.disabled = true;
    } else {
      messageInputBox!.disabled = true;
      sendButton!.disabled = true;
      connectButton!.disabled = false;
      disconnectButton!.disabled = true;
    }
  }
}

function handleReceiveChannelStatusChange(event: any) {
  if (receiveChannel) {
    console.log(
      `Receive channel's status has changed to ${receiveChannel.readyState}`,
    );
  }
}


function sendMessage() {
  const message = messageInputBox!.value;
  sendChannel!.send(message);

  messageInputBox!.value = "";
  messageInputBox!.focus();
}


function handleReceiveMessage(event: { data: string; }) {
  const el = document.createElement("p");
  const textNode = document.createTextNode(event.data);

  el.appendChild(textNode);
  receiveBox!.appendChild(el);
}


function disconnectPeers() {
  // Close the RTCDataChannels if they're open.

  sendChannel!.close();
  receiveChannel!.close();

  // Close the RTCPeerConnections

  localConnection!.close();
  remoteConnection!.close();

  sendChannel = null;
  receiveChannel = null;
  localConnection = null;
  remoteConnection = null;

  // Update user interface elements

  connectButton!.disabled = false;
  disconnectButton!.disabled = true;
  sendButton!.disabled = true;

  messageInputBox!.value = "";
  messageInputBox!.disabled = true;
}

}


