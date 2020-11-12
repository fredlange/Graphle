import {ErrorMessage, IncomingMessage, LinkErrorReasons, LinkEvents, RequestMessage, UDPLink} from "./ClusterLink";
import PromiseController from 'promise-controller';
import {VerboseLogging} from "../../logging/verbose.logger";

export class ExchangeableLink extends UDPLink {

    /*
    Store controlled promises by id
     */
    private inflightRequests = {}

    constructor(opt: { linkPort?: number, serverPort: number }) {
        super(opt);
        this.on(LinkEvents.REPLY, (reply: IncomingMessage) => {
            // TODO What if the reply ref does not exists?
            const req = this.inflightRequests[reply.ref]
            try {
                if (req) {
                    delete this.inflightRequests[reply.ref]
                    req.resolve(reply.payload)
                }
            } catch (e) {
                VerboseLogging.error('Error during Reply handling', e)
                req.reject(e)
            }
        })

    }

    exchange(port: number, msg: RequestMessage): Promise<IncomingMessage> {
        const timeoutReasonCode = 'NO_REPLY';

        const pc = new PromiseController({
            timeout: 1000, // TODO: Should not be hardcoded later on. Will do for now
            timeoutReason: timeoutReasonCode
        });
        this.inflightRequests[msg.id] = pc
        pc.call(() => this.sendMessage(port, msg))

        return this.inflightRequests[msg.id].promise
            .catch(e => {
                if (e.message == timeoutReasonCode) {
                    this.emit(LinkEvents.TIMEOUT, {
                        code: LinkErrorReasons.TIMEOUT,
                        msg: msg
                    } as ErrorMessage)
                    throw new RequestTimeoutError(msg.id)
                } else {
                    throw e
                }
            });
    }

    _isInFlight(id): boolean {
        return this.inflightRequests.hasOwnProperty(id)
    }

}

export class RequestTimeoutError extends Error {
    constructor(id: string) {
        super(`RequestTimeout ${id}`);
        this.name = 'RequestTimeoutError'
    }
}