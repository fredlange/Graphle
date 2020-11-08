import {createSocket, RemoteInfo, Socket} from "dgram";
import {EventEmitter} from "events";
import {getRandomInt} from "../DummyUtils";
import {Component} from "../cluster.registry";

export interface ClusterLink extends EventEmitter {
    onMessage(handler: (msg: IncomingMessage) => void)

    sendMessage(port: number, msg: Message)

    sendToServer(msg: string)

    exchange(port: number, msg: RequestMessage): Promise<IncomingMessage>

}

export interface StateRehydratePayload {
    name: string
    state: {
        schemaSource: string
    }
}

interface Message {
    type: LinkEvents
    payload: any
}

export class IncomingMessage implements Message {
    ref: string | undefined
    sender: {
        port: number;
    } | undefined
    type: LinkEvents;
    payload: any;

    constructor(msg: Buffer, rInfo: RemoteInfo) {
        const _msg = msg.toString()


        try {
            const {id, payload, type, ref} = JSON.parse(_msg)
            this.sender = {
                port: rInfo.port
            }
            this.ref = id || ref
            this.payload = payload
            this.type = type
        } catch (e) {
            console.error('JSON PARSE ERROR', e)
        }

        if (!this.payload) throw Error('Payload is totaly crap!')

    }

    isTyped(): boolean {
        return !!this.type
    }
}

export class RequestMessage implements Message {
    id: string;
    sender: {
        port: number
    }
    type: LinkEvents;
    payload: any;

    constructor(peer: Component, props: { type: LinkEvents, payload: any }) {
        try {
            this.sender = {
                port: peer.port
            }
            // TODO: Generate some serious random stuff...
            this.id = getRandomInt(100000, 500000)
            this.payload = props.payload
            this.type = props.type
        } catch (e) {
            console.error('JSON PARSE ERROR', e)
        }

        if (!this.payload) throw Error('Payload is totaly crap!')

    }
}

export class ResponseMessage implements Message {
    ref: string
    type: LinkEvents;
    payload: any;

    constructor(ref: string, payload: any) {
        try {
            this.ref = ref
            this.payload = payload
            this.type = LinkEvents.REPLY
        } catch (e) {
            console.error('JSON PARSE ERROR', e)
        }

        if (!this.payload) throw Error('Payload is totaly crap!')
    }
}


/*
Events emitted by the Link EventEmitter
TODO These are currently not segregated correctly
 */
export enum LinkEvents {
    REPLY = 'reply',
    EXCHANGE_MSG = 'exchange_msg',
    TIMEOUT = 'timeout',
    POOP = 'poop',
    PING = 'PING',
    QUERY = 'QUERY',
}

export interface LinkOptions {
    serverPort: number
    linkPort?: number
}
export enum LinkErrorReasons {
    TIMEOUT = 'NO_REPLY_IN_TIME'
}

export interface ErrorMessage {
    code: LinkErrorReasons,
    msg: Message
}
export class UDPLink extends EventEmitter implements ClusterLink {

    private readonly serverPort: number
    private socket: Socket

    constructor(opt: LinkOptions) {
        super()
        this.serverPort = opt.serverPort
        this.socket = createSocket('udp4')
        this.socket
            .on('connect', () => console.log('Connected'))
            .on('listening', () => {
                const address = this.socket.address();
                console.log(`Peer listening ${address.address}:${address.port}`);
            })
            .bind(opt.linkPort)

        this.setupMessageResponseHandler()

    }

    exchange(port: number, msg: RequestMessage): Promise<IncomingMessage> {
        let promise = new Promise<IncomingMessage>((resolve, reject) => {
            this.on(LinkEvents.REPLY, (reply: IncomingMessage) => {
                if (reply.ref == msg.id) {
                    resolve(reply.payload)
                }
            })
        });

        this.sendMessage(port, msg)
        return promise

    }

    setupMessageResponseHandler() {
        this.socket.on('message', (m, r) => {
                const incomingMessage = new IncomingMessage(m, r);
                if (incomingMessage.isTyped()) this.emit(incomingMessage.type, incomingMessage)
            }
        )
    }

    onMessage(messageHandlerFn: (msg: IncomingMessage) => void) {
        this.socket.on('message', (m, r) =>
            messageHandlerFn(new IncomingMessage(m, r)))
    }

    sendMessage(port: number, msg: Message) {
        const _msg = JSON.stringify(msg)
        this.socket.send(_msg, port)

    }

    sendToServer(msg: string): void {
        this.socket.send(msg, this.serverPort)
    }

    shutdownLink() {
        this.socket.close()
    }


}