import {IMessageInbound, Peer} from "./types";
import {RemoteInfo} from "dgram";

export class IncomingMessage implements IMessageInbound {
    payload: any;
    component: Peer;
    id: string;
    type: string;

    constructor(msg: Buffer, rInfo: RemoteInfo) {
        const {id, type, component, payload} = JSON.parse(msg.toString()) as IMessageInbound
        this.component = {
            name: component.name,
            port: rInfo.port,
            address: rInfo.address,
            state: {
                schemaSource: payload.schemaSource
            },
            role: component.role
        }
        this.payload = payload
        this.id = id
        this.type = type
    }


}