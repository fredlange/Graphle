import {IMessageInbound, IOutboundMessage} from "./types";
import EventEmitter from "events";

class RequestRegistryEmitter extends EventEmitter.EventEmitter {
}

export const RequestRegistry = new (class {

    private event = new RequestRegistryEmitter()

    setAsAwaitResponse(msg: IOutboundMessage): Promise<IMessageInbound> {
        const kek = {
            msg: msg,
            timeout: setTimeout(() => this.event.emit('TIMEOUT', msg.id), 5000)
        }
        return new Promise<IMessageInbound>(((resolve, reject) => {
            this.event.on('RESPONSE', (args: IMessageInbound) => {
                console.log('Responding', args)
                clearTimeout(kek.timeout)
                resolve(args)
            })

            this.event.on('TIMEOUT', () => {
                // console.log('TIMEOUT!!!', kek.msg)
                reject(kek.msg)
            })


        }))

    }

    callWithRespond(msg: IMessageInbound) {
        this.event.emit('RESPONSE', msg)
    }

})()