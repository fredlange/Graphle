
export interface Peer {
    name: string,
    port: number
}

export interface IPeerRegistry {
    getPeerByName(name): Peer
    pushMultiplePeers(peers: Peer[])
    getAllPeers(): Peer[]
    getPeersOfPeer(peer: Peer)
    pushPeer(peer: Peer)
    removePeer(peer: Peer)
}
