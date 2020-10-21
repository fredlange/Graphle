import {IncomingMessage, LinkEvents, RequestMessage, ResponseMessage, Transport} from "./Transport";
import {PeerRegistry} from "./Peer";
import {getRandomInt} from "./DummyUtils";
import {EventEmitter} from "events";

interface ComManagerConfig {
    appName: string
    link: Transport
}

export enum ComEvents {
    NOTIFY_MANAGER = "NOTIFY_MANAGER",
    MESSAGE_FROM_SERVER = "MESSAGE_FROM_SERVER",
    NEW_PEER = 'NEW_PEER',
    STATE_REHYDRATE = "STATE_REHYDRATE"
}

export class ComManager extends EventEmitter {

    private readonly appName: string
    private readonly link: Transport
    private readonly peers

    constructor(config: ComManagerConfig) {
        super()
        this.appName = config.appName
        this.peers = new PeerRegistry(config.appName)
        this.link = config.link

        this.link.on(LinkEvents.PING, () => {
            this.link.sendToServer(JSON.stringify({
                type: 'RESPONSE',
                peer: {
                    name: this.appName
                },
                payload: {
                    status: 'OK'
                }
            }))

        })

        this.link.on(LinkEvents.POOP, (incomingMessage: IncomingMessage) => {

            const seriousResponse = () => {
                let responseMessage = new ResponseMessage(
                    incomingMessage.ref, // Incoming message does not have ID?
                    {
                        iHate: 'gesle' + incomingMessage.payload.greeting
                    }
                );

                // console.log('Sending:', responseMessage, 'as response to', incomingMessage)
                this.link.sendMessage({
                    port: incomingMessage.sender.port,
                    name: 'reg' // TODO Useless...
                }, responseMessage)
            }

            // TODO Only during development to simulate delay
            setTimeout(() => {
                seriousResponse()
            }, getRandomInt(1000, 4000))
        })

        this.link.onMessage(msg => {
            if (!msg.isTyped()) {
                // Untyped only on message from server!
                // Multiple peers such as initial connect
                if (Array.isArray(msg.payload)) {
                    this.emit(ComEvents.STATE_REHYDRATE, msg.payload)
                    this.peers.pushMultiplePeers(msg.payload)
                }
                // Single peer, on continues connection
                else {
                    this.emit(ComEvents.NEW_PEER, msg.payload)
                    this.peers.pushOnNewPeer(msg.payload)
                }
            }
        })
    }

    connectWithPayload(payload: any) {
        this.link.sendToServer(JSON.stringify({
            peer: {
                name: this.appName
            },
            payload: payload
        }))
    }


    /*
    Temporary exposure of exchange. Should not actually be used
     */
    _exchange(name: string, payload: any): Promise<any> {

        let peer = this.peers.getPeerByName(name);
        const msg = new RequestMessage(peer, {
            type: LinkEvents.POOP,
            payload: payload
        })

        return this.link.exchange(peer, msg)
    }

}