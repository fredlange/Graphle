import {ComponentRoles} from "./app";

interface Component extends IConsumer {
    name: string
    role: ComponentRoles
}

export interface Peer extends Component, IProducer {
    state: PeerState
}

export interface PeerState {
    schemaSource: string
}

export interface IProducer {
    port: number
    address: string
}

export interface IConsumer {

}

export interface IMessage {
    payload: any
    id: string
    type: string

    // Could set an optional ttl here
    // ttl: NodeJS.Timeout, setTimeout(() => emit.timeout......)
}

export interface IMessageInbound extends IMessage {
    component: Peer
}

export interface IOutboundMessage extends IMessage{
    peer: Peer
}