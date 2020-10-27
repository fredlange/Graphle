import {IncomingMessage, LinkEvents, RequestMessage, ResponseMessage, Transport} from "./Transport";
import {PeerRegistry} from "./Peer";
import {getRandomInt} from "./DummyUtils";
import {EventEmitter} from "events";
import {ComponentRoles} from "../manager/app";

interface ComManagerConfig {
    appName: string
    link: Transport,
    role: ComponentRoles
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
    private readonly role: ComponentRoles

    constructor(config: ComManagerConfig) {
        super()
        this.appName = config.appName
        this.peers = new PeerRegistry(config.appName)
        this.link = config.link
        this.role = config.role

        this.link.on(LinkEvents.PING, () => {
            this.link.sendToServer(JSON.stringify({
                type: 'RESPONSE',
                component: {
                    name: this.appName
                },
                payload: {
                    status: 'OK'
                }
            }))

        })

        this.link.onMessage(msg => {
            if (!msg.isTyped()) {

                console.log('Message', msg)

                // Untyped only on message from server!
                // Multiple peers such as initial connect
                if (Array.isArray(msg.payload)) {
                    this.emit(ComEvents.STATE_REHYDRATE, msg.payload)
                    this.peers.pushMultiplePeers(msg.payload)
                }
                // Single component, on continues connection
                else {
                    this.emit(ComEvents.NEW_PEER, msg.payload)
                    this.peers.pushOnNewPeer(msg.payload)
                }
            }
        })
    }

    onQuery(fn: (msg: IncomingMessage) => Promise<ResponseMessage>) {

        this.link.on(LinkEvents.QUERY, (msg: IncomingMessage) => {

            fn(msg)
                .then(p => {
                    this.link.sendMessage({
                        port: msg.sender.port,
                        name: 'reg' // TODO Useless...
                    }, p)
                })


        })

    }

    connectWithPayload(payload: any) {
        this.link.sendToServer(JSON.stringify({
            component: {
                name: this.appName,
                role: this.role
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
            type: LinkEvents.QUERY, // TODO Should probably not be hardcoded?
            payload: payload
        })

        return this.link.exchange(peer, msg)
    }

}