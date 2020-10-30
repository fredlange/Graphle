export interface Peer {

    name: string,
    port: number

}


export const PeerRegistry = class {


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

    private updatePortOfPeer(peer: Peer) {
        this.getPeerByName(peer.name).port = peer.port
    }

    private appendPeerNotSelf(peer: Peer) {
        if (peer.name != this.nameOfSelf) this.registry.push(peer)
    }

    private isKnownByPort(peer: Peer): boolean {
        return this.registry
            .filter(p => p.port == peer.port)
            .length > 0
    }

    private isKnownByName(peer: Peer): boolean {
        return this.registry
            .filter(p => p.name == peer.name)
            .length > 0
    }
}