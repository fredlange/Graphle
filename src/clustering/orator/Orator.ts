import {ClusterManager} from "../ClusterManager";
import {ComponentRoles} from "../../cluster-orator/app";
import {ExchangeableLink} from "../link/ExchangeableLink";


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