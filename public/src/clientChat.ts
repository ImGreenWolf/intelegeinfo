import { FriendRelation, User } from "../../generated/prisma";
import { createNode } from "./utils.js";


main()

async function main() {


    const res = await fetch('/user/social/list')

    if(!res.ok)
        return;

    const json = await res.json();

    initSocket(json)

    document.getElementById('list')?.replaceChildren(...json.friends.map(friend => createNode('button',
        {innerText: friend.user.username,
        id: 'chatid-'+friend.id,
        onclick: () => {
        loadChat(friend.id, friend, friend.user)
    }})))
}
var activeConversation: {chatId: number, chatData: FriendRelation, friend: User} | undefined = undefined
var socket: WebSocket | undefined = undefined
var lastMessage: {content: string, fromId: number, toId: number, container?: HTMLElement} | undefined = undefined
async function loadChat(chatId: number, chatData: FriendRelation, friend: User) {
    const res = await fetch('/user/social/chat/channel/'+chatId)

    if(!res.ok)
        return;
    const elem = document.getElementById('chat') as HTMLTextAreaElement;
    elem.value = ''
    lastMessage = undefined
    activeConversation = {chatId, chatData, friend};
    scrollToBottom(elem)
    const json = await res.json();


    for(const messages of json)
        addMessage(messages, friend, elem)
}

function addMessage(message: {content: string, fromId: number, toId: number, container?: HTMLElement}, friend: User, elem = document.getElementById('chat')) {

    const ownMessage = message.toId == friend.id
    if(lastMessage && (lastMessage.toId == friend.id) == ownMessage && message.container) {
        if(!lastMessage.container)  {
            
            const msgContainer = createNode('div', {className: 'chat-content-container'})
            const chatMsg = createNode('div', {className: 'console-chat ' + (ownMessage ? 'chat-ownMessage'  : ''), html: [msgContainer]})
            lastMessage.container = msgContainer
            elem?.appendChild(chatMsg)
        }

        lastMessage.container.appendChild(
            createNode('span', {innerText: message.content, className: 'chat-content'})
        )
    } else {
         if(!message.container)  {
            
            const msgContainer = createNode('div', {className: 'chat-content-container'})
            const chatMsg = createNode('div', {className: 'console-chat ' + (ownMessage ? 'chat-ownMessage'  : ''), html: [msgContainer]})
            message.container = msgContainer
            elem?.appendChild(chatMsg)
        }
        message.container.appendChild(
            createNode('span', {innerText: message.content, className: 'chat-content'})
        )
    }

    if(elem && elem?.scrollTop + 100 < elem?.scrollHeight)
        scrollToBottom(elem)

    lastMessage = message

}

function scrollToBottom(elem: HTMLElement) {
    elem.scrollTop = elem.scrollHeight
}

function initSocket(chatObj: any, elem = document.getElementById('chat')) {
    socket = new WebSocket('/chat')

    socket.onmessage = (ev) => {
        const {type, convId, content,fromId,toId} = JSON.parse(ev.data)
        
        switch(type) {
            case 'message': 
            if(convId == activeConversation && activeConversation)
                addMessage({content, fromId, toId}, activeConversation.friend, elem)
            else 
                document.getElementById('chatid-'+convId)?.classList.add('unread')
            break;
        }
    }

    msg.onkeydown = async (ev) => {
        // const res = fetch('/user/social/chat/channel/'+openedChatId, {
        //     method: 'post',
        //     headers: {'Content-Type': 'application/json'},
        //     body: JSON.stringify({body: msg.value})
        // })
         if (!(ev.key === "Enter" && !ev.shiftKey))
            return;
        if(!activeConversation)
            return;
        ev.preventDefault();
        socket?.send(JSON.stringify({type: 'send', convId: activeConversation.chatId, content: msg.value.trim()}))
        addMessage({content: msg.value, fromId:1, toId: activeConversation.friend.id}, activeConversation.friend, elem)
        msg.value = ''

    }

}


const msg = document.getElementById('msg')! as HTMLTextAreaElement

