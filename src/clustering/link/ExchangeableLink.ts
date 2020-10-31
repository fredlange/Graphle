import {ErrorMessage, IncomingMessage, LinkErrorReasons, LinkEvents, RequestMessage, UDPLink} from "./ClusterLink";
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
                console.log('Error during Reply handling', e)
            }
        })

    }

    exchange(peer: Peer, msg: RequestMessage): Promise<IncomingMessage> {
        const timeoutReasonCode = 'NO_REPLY';

        const pc = new PromiseController({
            timeout: 1000, // TODO: Should not be hardcoded later on. Will do for now
            timeoutReason: timeoutReasonCode
        });
        this.inflightRequests[msg.id] = pc
        pc.call(() => this.sendMessage(peer, msg))

        return this.inflightRequests[msg.id].promise
            .catch(e => {
                if (e.message == timeoutReasonCode) {
                    this.emit(LinkEvents.TIMEOUT, {
                        code: LinkErrorReasons.TIMEOUT,
                        msg: msg
                    } as ErrorMessage)
                } else {
                    throw e
                }
            });
    }

    _isInFlight(id): boolean {
        console.log('In flight', this.inflightRequests)
        return this.inflightRequests.hasOwnProperty(id)
    }

}