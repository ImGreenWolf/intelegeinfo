

// const WSUrl = (window.location.protocol == "https:" ? "wss://" : "ws://") + window.location.hostname  + ":" + window.location.port + "/rtc"

import { createNode } from "./components.js";


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
    localAudioStream: MediaStream | undefined
    localAudioSender: RTCRtpSender[] = []
    //remote audio
    audio: HTMLAudioElement | undefined
    onData: (data: string) => void = (data) => () => {}
    onStartVoice: (track: MediaStreamTrack, stream: readonly MediaStream[]) => void = (data) => console.log(data)

    constructor(thistargetId,thisClientId, signaler: WebSocket, isHost, onConnection: (dataChannel: RTCDataChannel) => void, options?: {dataChannelOptions?: RTCDataChannelInit})
    {
        var configuration: RTCConfiguration = {
            iceServers : [ 
                { urls: "stun:stun.l.google.com:19302" },
               {
                urls: "turn:intelegeinfo.ro:3478",
                username: "webrtc",
                credential: 'TODOimplementpass' // TODO i know this isnt okay. cant be bothered right now though
               },
               { urls: "stun:stun.l.google.com:5349" },
                { urls: "stun:stun1.l.google.com:3478" },
                { urls: "stun:stun1.l.google.com:5349" },
             ]
        };

      

          
        this.polite = !isHost
        // const WSUrl = (window.location.protocol == "https:" ? "wss://" : "ws://") + window.location.hostname  + ":" + window.location.port + "/rtc?session="+sessionId
        // const signaler = new WebSocket(WSUrl) // 

        if (signaler.readyState !== WebSocket.OPEN) {
             console.warn('Bailed out rtc connection due to signaling state unavaialable');
             return;
        }
            


        this.pc! = new RTCPeerConnection(configuration); // create local peer connection
        // console.log(this.id,'is caller : ', isHost, "target: ",thistargetId)
       
        this.dc = this.pc!.createDataChannel('data', options ? options.dataChannelOptions : undefined) // data channel for communication created locally on host
        this.dc.binaryType = 'arraybuffer';
        console.log(this.id, "is host:", isHost, "caller:", thisClientId, "callee:", thistargetId)

          
        this.dc.onclose = () => {
            this.dc = undefined;
        }
          
        this.dc.onerror = (err) => {
            console.error("DATA CHANNEL ERROR: ", err);
            
            this.dc = undefined;
        }
            // this.beginSendingAudio()



        this.pc!.ontrack = ({ track, streams }) => {
            //  this.audio = createNode('audio');
            // this.audio.autoplay = true;
            // document.body.appendChild(this.audio)
              this.audio = createNode('audio');
              this.audio.autoplay = true
            // this.audio.autoplay = true;
            document.body.appendChild(this.audio)
            track.onunmute = () => {
                if(!this.audio)
                    return
                if (this.audio!.srcObject) 
                    return;
                this.audio!.srcObject! = streams[0];
                        
            };

            this.onStartVoice(track,streams)
        };
            //ready to negotiate step 1
        this.pc!.onnegotiationneeded = async () => {
            try {
                this.makingOffer = true;
                const offer = await this.pc?.createOffer() // 1
                await this.pc!.setLocalDescription(offer); // 2
                signaler.send(JSON.stringify({type: "rtc", targetId: thistargetId, description: offer })); //this.pc!.localDescription //3
                // console.log(this.id,'making offer. ',"target: ",thistargetId)
                console.log(this.id,'negotiation needed')
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
            const pair = this.pc!.sctp!.transport.iceTransport.getSelectedCandidatePair();
            console.log(pair!);
            if(onConnection)
                onConnection(newDC)
            newDC.addEventListener('message', ev => {
                this.onData(ev.data)
            })
        }

        this.pc!.oniceconnectionstatechange = () => {
            console.log(this.id, "ICE state:", this.pc!.iceConnectionState);

            switch (this.pc!.iceConnectionState) {
                case "failed":
                    console.warn(this.id, "ICE failed, trying ICE restart");
                    try {
                        this.pc?.restartIce();
                    } catch (err) {
                        console.error(this.id, "ICE restart error:", err);
                    }
                    break;

                case "disconnected":
                    console.warn(this.id, "ICE disconnected, may recover automatically");
                    // it may reconnect
                    break;

                case "closed":
                    console.log(this.id, "ICE closed, peer connection is gone");
                    break;
            }
        };

        this.pc!.onconnectionstatechange = () => {
            console.log(this.id, "Connection state:", this.pc!.connectionState);

            switch (this.pc!.connectionState) {
                case "connected":
                    console.log(this.id, "WebRTC connected.");
                    break;

                case "disconnected":
                    console.warn(this.id, "WebRTC disconnected. (may recover)");
                    break;

                case "failed":
                    console.error(this.id, "WebRTC failed, closing & cleaning up");
                    this.close();
                    break;

                case "closed":
                    console.log(this.id, "WebRTC connection closed");
                    this.onClose()
                    break;
            }
        };

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
                    if (this.ignoreOffer) return;
                    this.isSettingRemoteAnswerPending = description.type === "offer";

                    console.log(this.id,'setting remote description', description.type)

                    await this.pc!.setRemoteDescription(description); // step 3: describe the remote connection
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
                        // if(this.pc?.remoteDescription)
                        await this.pc!.addIceCandidate(candidate);
                    } catch (err) {
                        if (!this.ignoreOffer) {
                            console.error(err)
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

    public send(data: any)
    {
        if(this.pc?.connectionState == "failed" || this.pc?.connectionState == "closed")
        {
            this.pc = undefined
            return;
        }
        if(this.dc)
            if(this.pc!.connectionState == 'connected' && this.dc.readyState == 'open')
                this.dc.send(data)
            else
            {
                setTimeout(() => {
                    this.pc?.restartIce()
                }, 5000);
                console.error( "Connection is " + this.pc!.connectionState +". And datachannel is " + this.dc.readyState)
            }
           
    }

    public close()
    {
        this.pc?.close()
        this.onClose()
    }

    protected onClose()
    {
        // TODO nothing right now, remove microphone, announce user etc
    }

    public beginSendingAudio(): Promise<MediaStream>
    {
        return new Promise(resolve => {
            const constrains: MediaStreamConstraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    //@ts-expect-error
                    suppressLocalAudioPlayback: true
                }
            }
            navigator.mediaDevices.getUserMedia(constrains).then(stream => {
                // if(this.localAudioStream)
                //     return;
                this.localAudioStream = stream
                
                for(const track of stream.getTracks())
                    this.pc?.addTrack(track, stream)

                resolve(stream)
            })
        })
        
    }
    // stop sending audio permenantly
    public stopSendingAudio()
    {
        for(const track of this.localAudioStream?.getTracks()!)
        track.stop()
        // navigator.mediaDevices.getUserMedia({audio: false}).then(stream => {
        //     this.localAudioStream = undefined
        //     for(const track of  this.localAudioSender)
        //          this.pc?.removeTrack(track)
        // })
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


