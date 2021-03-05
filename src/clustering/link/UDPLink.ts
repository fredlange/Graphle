import {EventEmitter} from "events";
import {createSocket, Socket} from "dgram";
import {VerboseLogging} from "../../logging/verbose.logger";
import {ClusterLink, IncomingMessage, LinkEvents, Message, NodeOptions, RequestMessage} from "./ClusterLink";

export class UDPLink extends EventEmitter implements ClusterLink {

    private readonly serverPort: number
    private socket: Socket

    constructor(opt: NodeOptions) {
        super()
        this.serverPort = opt.bootstrapPort
        this.socket = createSocket('udp4')
        this.socket
            .on('connect', () => VerboseLogging.debug('Connected'))
            .on('listening', () => {
                const address = this.socket.address();
                VerboseLogging.info(`Component listening ${address.address}:${address.port}`);
            })
            .bind(opt.node.port, opt.node.address)
        // .bind(opt.nodePort)

        this.setupMessageResponseHandler()

    }

    exchange(port: number, msg: RequestMessage): Promise<IncomingMessage> {
        let promise = new Promise<IncomingMessage>((resolve, reject) => {
            this.on(LinkEvents.REPLY, (reply: IncomingMessage) => {
                if (reply.ref == msg.id) {
                    resolve(reply.payload)
                }
            })
        });

        this.sendMessage(port, msg)
        return promise

    }

    setupMessageResponseHandler() {
        this.socket.on('message', (m, r) => {
                const incomingMessage = new IncomingMessage(m, r);
                if (incomingMessage.isTyped()) this.emit(incomingMessage.type, incomingMessage)
            }
        )
    }

    onMessage(messageHandlerFn: (msg: IncomingMessage) => void) {
        this.socket.on('message', (m, r) =>
            messageHandlerFn(new IncomingMessage(m, r)))
    }

    sendMessage(port: number, msg: Message) {
        const _msg = JSON.stringify(msg)
        this.socket.send(_msg, port)

    }

    sendToServer(msg: string): void {
        this.socket.send(msg, this.serverPort)
    }

    shutdownLink() {
        this.socket.close()
    }


}