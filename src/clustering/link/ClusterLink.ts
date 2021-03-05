import {RemoteInfo} from "dgram";
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
    port: number,
    state: {
        schemaSource: string
    }
}

export interface Message {
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

export interface NodeOptions {
    bootstrapPort: number
    node?: {
        port?: number
        address?: string
    }
    // nodePort?: number
    // nodeAddress?: string
}

export enum LinkErrorReasons {
    TIMEOUT = 'NO_REPLY_IN_TIME'
}

export interface ErrorMessage {
    code: LinkErrorReasons,
    msg: Message
}
