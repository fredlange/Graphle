import {createSocket} from 'dgram'
import {v4 as uuidv4} from 'uuid'
import {IncomingMessage} from "./IncomingMessage";
import {PeerRegistry} from "./Peer";
import {RequestRegistry} from "./RequestRegistry";
import {IOutboundMessage, Peer} from "./types";
import {LinkEvents} from "../transport/Transport";

/**
 * APP ONE
 */


export class UDPClusterManager {

    static server = createSocket('udp4')
    registry = PeerRegistry
    requestRegistry = RequestRegistry
    port = 41236


    constructor() {
        UDPClusterManager.server
            .on('connect', () => console.log('Connected'))
            .bind(this.port)
        console.log('Server is up and running')
    }

    sendMessage(payload, peer: Peer, type = undefined) {
        let msg = JSON.stringify(this.makeMessage(peer, {payload, type}));
        UDPClusterManager.server.send(msg, peer.port)
    }

    async exchange(payload: any, peer: Peer, type: string): Promise<any> {

        const msg = this.makeMessage(peer, {payload, type})
        UDPClusterManager.server.send(JSON.stringify(msg), peer.port)
        return await this.requestRegistry.setAsAwaitResponse(msg)
    }

    private makeMessage(peer, obj: { payload: any, type: string }): IOutboundMessage {
        return {
            id: uuidv4(),
            peer: peer,
            ...obj
        }

    }

    // TODO
    pingPeers() {
        setInterval(async () => {
            // console.log('Ping all peers')
            for (const p of this.registry.getAllPeers()) {
                try {
                    await this.exchange({}, p, LinkEvents.PING)
                } catch (e) {
                    this.registry.removePeer((e as IOutboundMessage).peer)
                }

            }
        }, 3000)

    }

    handleMessages() {
        UDPClusterManager.server
            .on('message', ((msg, rinfo) => {
                const _msg = new IncomingMessage(msg, rinfo)

                switch (_msg.type) {

                    case 'RESPONSE': {
                        this.requestRegistry.callWithRespond(_msg)
                        break
                    }
                    default: {
                        const {peer, payload} = _msg
                        let peersOfPeer = this.registry.getPeersOfPeer(peer);
                        for (const p of peersOfPeer) {
                            this.sendMessage({
                                ...peer,
                                ...payload
                            }, p)
                        }
                        this.sendMessage(peersOfPeer, peer)
                        this.registry.pushOnNewPeer(peer)
                    }

                }

            }))
            .on('listening', () => {
                const address = UDPClusterManager.server.address();
                console.log(`server listening ${address.address}:${address.port}`);
            })

    }

}
