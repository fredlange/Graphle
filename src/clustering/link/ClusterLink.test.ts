import {ClusterLink, IncomingMessage, LinkEvents, RequestMessage} from "./ClusterLink";
import {ExchangeableLink} from "./ExchangeableLink";

describe('ClusterLink', () => {
    const RECIPIANT_PORT = 1337;
    let link: ExchangeableLink

    beforeEach(() => {
        link = new ExchangeableLink({linkPort: RECIPIANT_PORT, serverPort: 9999})
    })
    afterEach(() => {
        link.shutdownLink()
    })

    describe('exchange', () => {

        test('should send message ', async (done) => {

            let msg = {
                id: 'UniqueId',
                payload: {
                    request: true
                },
                sender: {port: RECIPIANT_PORT},
                type: LinkEvents.EXCHANGE_MSG
            } as RequestMessage;

            const incomingMessage = makeIncomingMessage(msg, RECIPIANT_PORT)

            link.on(LinkEvents.EXCHANGE_MSG, d => {
                expect(d).toStrictEqual(incomingMessage)
                done()
            })

            await link.exchange({port: RECIPIANT_PORT, name: 'AnyPeer'}, msg)

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
                let incomingMessage = makeIncomingMessage(msg, RECIPIANT_PORT)

                // Fake response
                setTimeout(() => {
                    link.emit(LinkEvents.REPLY, incomingMessage)
                }, 1000)


                const poop = await link.exchange({port: RECIPIANT_PORT, name: 'AnyPeer'}, msg)
                expect(poop).toStrictEqual(incomingMessage)

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


                let incomingMessage = makeIncomingMessage(msg, RECIPIANT_PORT)

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


function makeIncomingMessage(msg: RequestMessage, port: number): IncomingMessage {
    // let _msg = {
    //     id: 'UniqueId',
    //     payload: {
    //         response: true
    //     },
    //     sender: {port: port},
    //     type: LinkEvents.REPLY
    // } as RequestMessage;

    return new IncomingMessage(new Buffer(JSON.stringify(msg)), {
        port: port,
        address: 'localhost',
        family: "IPv4",
        size: 1335
    })
}