interface Component extends IConsumer {
    name: string
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
    peer: Peer
}

export interface IOutboundMessage extends IMessage{
    peer: Peer
}