import {IMessageInbound, IOutboundMessage} from "./types";
import EventEmitter from "events";

class RequestRegistryEmitter extends EventEmitter.EventEmitter {
}

export const RequestRegistry = new (class {

    private event = new RequestRegistryEmitter()
    private inFlightRequests = {}

    setAsAwaitResponse(msg: IOutboundMessage): Promise<IMessageInbound> {
        this.inFlightRequests[msg.id] = {
            msg: msg,
            timeout: setTimeout(() => this.event.emit('TIMEOUT', msg.id), 5000)
        }

        return new Promise<IMessageInbound>(((resolve, reject) => {
            this.event.on('RESPONSE', (args: IMessageInbound) => {
                if (args.id == msg.id) {
                    clearTimeout(this.inFlightRequests[msg.id].timeout)
                    delete this.inFlightRequests[msg.id]
                    resolve(args)
                }

            })

            this.event.on('TIMEOUT', reqId => {
                if (reqId == msg.id) {
                    let req = this.inFlightRequests[reqId];
                    clearTimeout(req.timeout)
                    delete this.inFlightRequests[reqId]
                    reject(req.msg)
                }
            })


        }))

    }

    callWithRespond(msg: IMessageInbound) {
        this.event.emit('RESPONSE', msg)
    }

})()