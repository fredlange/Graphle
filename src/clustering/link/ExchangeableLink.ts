import {IncomingMessage, LinkEvents, RequestMessage, UDPLink} from "./ClusterLink";
import {Peer} from "../Peer";
import PromiseController from 'promise-controller';

export class ExchangeableLink extends UDPLink {

    /*
    Store controlled promises by id
     */
    private inflightRequests = {}

    constructor(opt: { linkPort?: number, serverPort: number }) {
        super(opt);
        this.on(LinkEvents.REPLY, (reply: IncomingMessage) => {
            // TODO What if the reply ref does not exists?
            try {
                const req = this.inflightRequests[reply.ref]
                if (req) {
                    delete this.inflightRequests[reply.ref]
                    req.resolve(reply)
                }
            } catch (e) {
                console.log('Error', e)
            }
        })

    }

    exchange(peer: Peer, msg: RequestMessage): Promise<IncomingMessage> {
        const pc = new PromiseController();
        this.inflightRequests[msg.id] = pc
        // wtf...?
        pc.call(() => 'FUUUUU')
        this.sendMessage(peer, msg)
        return this.inflightRequests[msg.id].promise;
    }

    _isInFlight(id): boolean {
        console.log('In flight', this.inflightRequests)
        return this.inflightRequests.hasOwnProperty(id)
    }

}