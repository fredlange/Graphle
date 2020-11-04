import {IPeerRegistry, Peer} from "./cluster.registry";

export class PeerRegistry implements IPeerRegistry {

    private registry: Peer[] = []
    private readonly nameOfSelf: string;

    constructor(nameOfSelf: string) {
        this.nameOfSelf = nameOfSelf;
        // setInterval(() => console.log('Peers of', nameOfSelf, this), 2000)
    }

    getPeerByName(name): Peer {
        let peer = this.registry.filter(p => p.name == name)[0];
        if (!peer) throw 'No component with name ' + name
        return peer
    }

    pushOnNewPeer(peer: Peer) {
        if (this.isKnownByName(peer)) this.updatePortOfPeer(peer)
        if (!this.isKnownByPort(peer)) this.appendPeerNotSelf(peer)
    }

    pushMultiplePeers(peers: Peer[]) {
        for (const p of peers) this.appendPeerNotSelf(p)
    }

    getAllPeers(): Peer[] {
        return this.registry
    }

    getPeersOfPeer(peer: Peer) {
        return this.registry
            .filter(p => p.port != peer.port)
    }


    removePeer(peer: Peer) {
        console.info('Removing component:', peer.name)
        this.registry.splice(this.registry.indexOf(peer), 1)
    }


    private isKnownByName(peer: Peer): boolean {
        return this.registry
            .filter(p => p.name == peer.name)
            .length > 0
    }

    private isKnownByPort(peer: Peer): boolean {
        return this.registry
            .filter(p => p.port == peer.port)
            .length > 0
    }

    private pushPeer(peer: Peer) {
        console.info('Pushing new component', peer)
        this.registry.push(peer)
    }

    private updatePortOfPeer(peer: Peer) {
        console.info('Updating port of', peer.name, 'to', peer.port)
        this.getPeerByName(peer.name).port = peer.port
    }

    private appendPeerNotSelf(peer: Peer) {
        if (peer.name != this.nameOfSelf) this.registry.push(peer)
    }






}