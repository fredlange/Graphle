
export interface Peer {
    name: string,
    port: number
}

export interface IPeerRegistry {
    getAllPeers(): Peer[]
    getPeerByName(name): Peer
    getPeersOfPeer(peer: Peer)

    pushOnNewPeer(peer: Peer)
    pushMultiplePeers(peers: Peer[])

    removePeer(peer: Peer)
}
