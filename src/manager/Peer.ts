import {Peer} from "./types";

export const ComponentRegistry = new (class {

    private registry: Peer[] = []

    constructor() {
        // setInterval(() => console.log('COMPONENT REGISTRY', this), 2000)
    }

    getAllPeers(): Peer[] {
        return this.registry
    }

    getPeersOfPeer(peer: Peer) {
        return this.registry
            .filter(p => p.port != peer.port)
    }

    getComponentsOtherThan(peer: Peer) {
        return this.registry
            .filter(p => p.port)
    }

    pushOnNewPeer(peer: Peer) {
        if (this.isKnownByName(peer)) this.updatePortOfPeer(peer)
        if (!this.isKnownByPort(peer)) this.pushPeer(peer)
    }

    removePeer(peer: Peer) {
        console.info('Removing component:', peer.name)
        this.registry.splice(this.registry.indexOf(peer), 1)
    }

    private getPeerByName(name: string): Peer {
        return this.registry.filter(p => p.name == name)[0]
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
})()