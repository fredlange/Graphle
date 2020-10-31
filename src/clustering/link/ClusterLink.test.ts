import {ClusterLink, IncomingMessage, LinkEvents, RequestMessage, UDPLink} from "./ClusterLink";
import {Peer} from "../Peer";
import PromiseController from 'promise-controller';

class ExchangeableLink extends UDPLink {

    /*
    Store controlled promises by id
     */
    private inflightRequests = {}

    constructor(opt: { linkPort?: number, serverPort: number }) {
        super(opt);
        this.on(LinkEvents.REPLY, (reply: IncomingMessage) => {
            // TODO What if the reply ref does not exists?
            console.log('REPLY EVENT TRIGGERED!', reply)
            try {
                const req = this.inflightRequests[reply.ref]

                if(req) {
                    req.resolve(reply)
                }
            } catch (e) {
                console.log('Error', e)
                // this.inflightRequests[reply.ref].reject()

            }
        })

    }

    exchange(peer: Peer, msg: RequestMessage): Promise<IncomingMessage> {
        const pc = new PromiseController();
        this.inflightRequests[msg.id] = pc
        // wtf...?
        pc.call(() => 'FUUUUU')
        return this.inflightRequests[msg.id].promise;
    }

}

describe('ClusterLink', () => {
    const RECIPIANT_PORT = 1337;
    let link: ExchangeableLink

    beforeEach(() => {
        link = new ExchangeableLink({linkPort: RECIPIANT_PORT, serverPort: 9999})
    })
    afterAll(() => {
        link.shutdownLink()
    })

    describe('exchange', () => {

        xtest('should send message ', () => {
            expect('to').toBe('poop')
        })

        xtest('should store request as inflightRequest ', () => {
            expect('to').toBe('poop')
        })

        describe('on ' + LinkEvents.REPLY, () => {

            test('should resolve with message payload', async (done) => {

                let msg = {
                    id: 'UniqueId',
                    payload: {
                        response: true
                    },
                    sender: {port: RECIPIANT_PORT},
                    type: LinkEvents.REPLY
                } as RequestMessage;

                const _bugg = new Buffer(JSON.stringify(msg))

                let incomingMessage = new IncomingMessage(_bugg, {
                    port: RECIPIANT_PORT,
                    address: 'localhost',
                    family: "IPv4",
                    size: 1335
                });

                // Fake response
                setTimeout(() => {
                    link.emit(LinkEvents.REPLY, incomingMessage)
                }, 1000)


                const poop = await link.exchange({port: RECIPIANT_PORT, name: 'AnyPeer'}, msg)
                expect(poop).toBe(incomingMessage)

                done()
            })

            xtest('should only emit once', async (done) => {


                let msg = {
                    id: 'UniqueId',
                    payload: {
                        response: true
                    },
                    sender: {port: RECIPIANT_PORT},
                    type: LinkEvents.REPLY
                } as RequestMessage;

                const _bugg = new Buffer(JSON.stringify(msg))

                let incomingMessage = new IncomingMessage(_bugg, {
                    port: RECIPIANT_PORT,
                    address: 'localhost',
                    family: "IPv4",
                    size: 1335
                });

                // First response
                setTimeout(() => {
                    link.emit(LinkEvents.REPLY, incomingMessage)
                }, 1000)

                // Second response
                setTimeout(() => {
                    link.emit(LinkEvents.REPLY, {
                        ...incomingMessage,
                        ref: 'Second'
                    } as IncomingMessage)
                }, 5000)


                const poop = await link.exchange({port: RECIPIANT_PORT, name: 'AnyPeer'}, msg)
                expect(poop).toBe(incomingMessage)

                done()

            })
        })


        xtest('should timeout ', () => {
            expect('to').toBe('poop')
        })


    })


})

