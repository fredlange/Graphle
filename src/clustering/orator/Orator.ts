import {ClusterManager} from "../ClusterManager";
import {ComponentRoles} from "../../cluster-orator/app";
import {ExchangeableLink} from "../link/ExchangeableLink";
import {ComponentRegistry} from "../ComponentRegistry";
import {IncomingMessage, LinkEvents} from "../link/ClusterLink";


export class Orator extends ClusterManager {

    constructor() {

        super({
            role: ComponentRoles.PEER,
            appName: 'Orator',
            link: new ExchangeableLink({
                serverPort: 1234,
                linkPort: 41236
            }),
            componentRegistry: new ComponentRegistry('Orator')
        })

        setInterval(() => this.pingPeers(), 5000)


        this.on('message', ((msg, rinfo) => {
            const _msg = new IncomingMessage(msg, rinfo)



            // switch (_msg.type) {
            //     default: {
            //         const component = _msg.sender.port
            //         const payload = _msg.payload
            //         let peersOfPeer = this.peers.getPeersOfComponent(component);
            //
            //         console.log('Peers of peer', peersOfPeer)
            //
            //         // Notify all peers of a new component
            //         if (component.role == ComponentRoles.PEER) {
            //             peersOfPeer.forEach(p => {
            //                 this._send(p.port, {
            //                     ...{component},
            //                     ...payload
            //                 })
            //             })
            //         }
            //
            //         // Return peers to the new component
            //         let actualPeersOfPeer = peersOfPeer
            //             .filter(p => p.role == ComponentRoles.PEER);
            //         this.sendMessage(actualPeersOfPeer, component)
            //
            //         // Push new component intro componentRegistry
            //         this.peers.pushOnNewComponent(component)
            //     }
            //
            // }

        }))


    }

    pingPeers() {
        console.log('Peers', this.peers)
        this.peers
            .getAllComponents()
            .forEach(p => this._exchange(p.name, {}, LinkEvents.PING)
                .catch(e => console.log('Need to remove peer', e)))
    }

}