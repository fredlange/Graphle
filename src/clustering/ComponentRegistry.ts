import {IComponentRegistry, Component} from "./cluster.registry";

export class ComponentRegistry implements IComponentRegistry {

    private registry: Component[] = []
    private readonly nameOfSelf: string;

    constructor(nameOfSelf: string) {
        this.nameOfSelf = nameOfSelf;
        setInterval(() => console.log('Peers of', nameOfSelf, this.registry.map(p => p.name)), 2000)
    }

    getComponentByName(name): Component {
        let peer = this.registry.filter(p => p.name == name)[0];
        if (!peer) throw 'No component with name ' + name
        return peer
    }

    pushOnNewComponent(peer: Component) {
        if (this.isKnownByName(peer)) this.updatePortOfPeer(peer)
        if (!this.isKnownByPort(peer)) this.appendPeerNotSelf(peer)
    }

    pushMultipleComponents(peers: Component[]) {
        for (const p of peers) this.appendPeerNotSelf(p)
    }

    getAllComponents(): Component[] {
        return this.registry
    }

    getPeersOfComponent(peer: Component) {
        return this.registry
            .filter(p => p.port != peer.port)
    }


    removeComponent(peer: Component) {
        console.info('Removing component:', peer.name)
        this.registry.splice(this.registry.indexOf(peer), 1)
    }

    private isKnownByName(peer: Component): boolean {
        return this.registry
            .filter(p => p.name == peer.name)
            .length > 0
    }

    private isKnownByPort(peer: Component): boolean {
        return this.registry
            .filter(p => p.port == peer.port)
            .length > 0
    }

    private updatePortOfPeer(peer: Component) {
        console.info('Updating port of', peer.name, 'to', peer.port)
        this.getComponentByName(peer.name).port = peer.port
    }

    private appendPeerNotSelf(peer: Component) {
        if (peer.name != this.nameOfSelf) this.registry.push(peer)
    }






}