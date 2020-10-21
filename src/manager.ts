import {UDPClusterManager} from "./manager/app";

const manager = new UDPClusterManager()
manager.handleMessages()
manager.pingPeers()