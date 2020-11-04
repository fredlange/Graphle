import {ExchangeableLink} from "../clustering/link/ExchangeableLink";
import {ClusterManager} from "../clustering/ClusterManager";
import {ComponentRoles} from "./app";


export class Orator extends ClusterManager {

    constructor() {

        super({
            role: ComponentRoles.PEER,
            appName: 'Orator',
            link: new ExchangeableLink({
                serverPort: 1234
            })
        })

        setInterval(this.pingPeers, 5000)

    }

    pingPeers() {
        super.peers.forEach(p => {
            super._exchange(p, {})
                .catch(e => {
                    console.log('Need to remove peer', e)
                })
        })
    }

}