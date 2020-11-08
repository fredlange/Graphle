import {UDPClusterManager} from "../cluster-orator/app";
import {Orator} from "../clustering/orator/Orator";

const manager = new Orator()
// manager.handleMessages()
manager.pingPeers()