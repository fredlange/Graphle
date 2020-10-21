import {IncomingMessage, Transport, LinkEvents, RequestMessage, ResponseMessage} from "./Transport";
import {PeerRegistry} from "./Peer";
import {getRandomInt} from "./DummyUtils";

interface ComManagerConfig {
    appName: string
    link: Transport
}

export class ComManager {

    private readonly appName: string
    private readonly link: Transport
    private readonly peers

    constructor(config: ComManagerConfig) {
        this.appName = config.appName
        this.peers = new PeerRegistry(config.appName)
        this.link = config.link

        this.link.on(LinkEvents.PING, () => {
            this.link.sendToServer(JSON.stringify({
                type: 'RESPONSE',
                peer: {
                    name: this.appName
                },
                payload: {
                    status: 'OK'
                }
            }))

        })

        console.log('UP', this)

        this.link.on(LinkEvents.POOP, (incomingMessage: IncomingMessage) => {

            const seriousResponse = () => {
                let responseMessage = new ResponseMessage(
                    incomingMessage.ref, // Incoming message does not have ID?
                    {
                        iHate: 'gesle' + incomingMessage.payload.greeting
                    }
                );

                // console.log('Sending:', responseMessage, 'as response to', incomingMessage)
                this.link.sendMessage({
                    port: incomingMessage.sender.port,
                    name: 'reg' // TODO Useless...
                }, responseMessage)
            }

            // TODO Only during development to simulate delay
            setTimeout(() => {
                seriousResponse()
            }, getRandomInt(1000, 4000))
        })

        this.link.onMessage(msg => {
            if (!msg.isTyped()) {
                // Untyped only on message from server!
                // Multiple peers such as initial connect
                if (Array.isArray(msg.payload)) this.peers.pushMultiplePeers(msg.payload)
                // Single peer, on continues connection
                else this.peers.pushOnNewPeer(msg.payload)
            }
        })

        // Initial notification
        this.link.sendToServer(JSON.stringify({
            peer: {
                name: this.appName
            },
            payload: {
                greeting: 'Yo'
            }
        }))
    }


    /*
    Temporary exposure of exchange. Should not actually be used
     */
    _exchange(name: string, payload: any): Promise<any> {

        let peer = this.peers.getPeerByName(name);
        const msg = new RequestMessage(peer, {
            type: LinkEvents.POOP,
            payload: payload
        })

        return this.link.exchange(peer, msg)
    }

}