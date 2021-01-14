import {ClusterEvents, ClusterManager} from "../ClusterManager";
import {ExchangeableLink} from "../link/ExchangeableLink";
import {ComponentRegistry} from "../ComponentRegistry";
import {IncomingMessage, LinkEvents, StateRehydratePayload} from "../link/ClusterLink";
import {VerboseLogging} from "../../logging/verbose.logger";
import {Graphlet} from "../../Graphlet";


export class Orator extends ClusterManager {

    constructor() {

        super({
            role: Graphlet.Role.MANAGER,
            appName: 'Orator',
            link: new ExchangeableLink({
                serverPort: 1234,
                linkPort: 41236
            }),
            componentRegistry: new ComponentRegistry('Orator')
        })

        setInterval(() => this.pingPeers(), 5000)

        this.on(ClusterEvents.CONNECT_AS_NEW_COMPONENT, (msg: IncomingMessage) => {
            VerboseLogging.info('New component notification', msg.payload)
            const comp = {
                port: msg.sender.port,
                schema: msg.payload.schemaSource,
                name: msg.payload.appName
            };


            // TODO: Perhaps send to all components, including self and then let each component filter itself out
            // Notify all other components
            this.peers.getPeersOfComponent(comp)
                .forEach(p => {
                    this._send(p.port, {
                        type: ClusterEvents.NEW_COMPONENT_IN_CLUSTER,
                        payload: comp
                    })
                })


            // Rehydrate the state of the new component
            this._send(msg.sender.port, {
                type: ClusterEvents.STATE_REHYDRATE,
                payload: this.peers.getPeersOfComponent(comp)
                    .map(p => ({
                        name: p.name,
                        port: p.port,
                        state: {
                            schemaSource: p.schema
                        }
                    } as StateRehydratePayload))
            })

            // Update component registry
            this.peers.pushOnNewComponent(comp)

        })


        this.on(ClusterEvents.UNRESPONSIVE_COMPONENT, name => {
            VerboseLogging.info('Unresponsive component', name)
            this.peers.removeComponent(
                this.peers.getComponentByName(name.name)
            )
            this.peers.getAllComponents()
                .forEach(c => {
                    this._send(c.port, {
                        type: ClusterEvents.STATE_REHYDRATE,
                        payload: this.peers.getPeersOfComponent(c)
                            .map(p => ({
                                name: p.name,
                                port: p.port,
                                state: {
                                    schemaSource: p.schema
                                }
                            } as StateRehydratePayload))
                    })
                })
        })


    }

    // TODO PING does not seem to work. No error is thrown. No timeout
    pingPeers() {
        this.peers
            .getAllComponents()
            .forEach(p => this._exchange(p.name, {}, LinkEvents.PING)
                .then(r => VerboseLogging.info('responded with ', r)))
    }

}