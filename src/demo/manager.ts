import {UDPClusterManager} from "../cluster-orator/app";

const manager = new UDPClusterManager()
manager.handleMessages()
manager.pingPeers()