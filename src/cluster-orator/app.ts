import {createSocket} from 'dgram'
import {v4 as uuidv4} from 'uuid'
import {IncomingMessage} from "./IncomingMessage";
import {RequestRegistry} from "./RequestRegistry";
import {IOutboundMessage} from "./types";
import {LinkEvents} from "../clustering/link/ClusterLink";
import {IComponentRegistry, Component} from "../clustering/cluster.registry";
import {ComponentRegistry} from "../clustering/ComponentRegistry";

/**
 * APP ONE
 */

export enum ComponentRoles {
    PEER = 'peer',
    SPECTATOR = 'spectator'
}

export class UDPClusterManager {

    static server = createSocket('udp4')
    componentRegistry: IComponentRegistry
        = new ComponentRegistry('UDPClusterManager')
    requestRegistry = RequestRegistry
    port = 41236


    constructor() {
        UDPClusterManager.server
            .on('connect', () => console.log('Connected'))
            .bind(this.port)
        console.log('Server is up and running')
    }

    sendMessage(payload, peer: Component, type = undefined) {
        let msg = JSON.stringify(this.makeMessage(peer, {payload, type}));
        UDPClusterManager.server.send(msg, peer.port)
    }

    async exchange(payload: any, peer: Component, type: string): Promise<any> {

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

    // TODO This solution will probably not remove the correct peer...?
    pingPeers() {
        setInterval(async () => {
            // console.log('Ping all peers')
            for (const p of this.componentRegistry.getAllComponents()) {
                try {
                    await this.exchange({}, p, LinkEvents.PING)
                } catch (e) {
                    this.componentRegistry.removeComponent((e as IOutboundMessage).peer)
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
                        const {component, payload} = _msg
                        let peersOfPeer = this.componentRegistry.getPeersOfComponent(component);

                        console.log('Peers of peer', peersOfPeer)

                        // Notify all peers of a new component
                        if (component.role == ComponentRoles.PEER) {
                            peersOfPeer.forEach(p => {
                                this.sendMessage({
                                    ...component,
                                    ...payload
                                }, p)
                            })
                        }

                        // Return peers to the new component
                        let actualPeersOfPeer = peersOfPeer
                            .filter(p => p.role == ComponentRoles.PEER);
                        this.sendMessage(actualPeersOfPeer, component)

                        // Push new component intro componentRegistry
                        this.componentRegistry.pushOnNewComponent(component)
                    }

                }

            }))
            .on('listening', () => {
                const address = UDPClusterManager.server.address();
                console.log(`server listening ${address.address}:${address.port}`);
            })

    }

}
