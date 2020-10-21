import {IMessageInbound, Peer} from "./types";
import {RemoteInfo} from "dgram";

export class IncomingMessage implements IMessageInbound {
    payload: any;
    peer: Peer;
    id: string;
    type: string;

    constructor(msg: Buffer, rInfo: RemoteInfo) {
        const {id, type, peer, payload} = JSON.parse(msg.toString()) as IMessageInbound
        this.peer = {
            name: peer.name,
            port: rInfo.port,
            address: rInfo.address
        }
        this.payload = payload
        this.id = id
        this.type = type
    }


}