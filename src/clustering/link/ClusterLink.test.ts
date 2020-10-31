import {ClusterLink, ErrorMessage, IncomingMessage, LinkEvents, RequestMessage} from "./ClusterLink";
import {ExchangeableLink} from "./ExchangeableLink";

describe('ClusterLink', () => {
    const RECIPIENT_PORT = 1337;
    let link: ExchangeableLink
    const DUMMY_REQUEST_MESSAGE = {
        id: 'uniqueId',
        payload: {
            request: true
        },
        sender: {port: RECIPIENT_PORT},
        type: LinkEvents.EXCHANGE_MSG
    } as RequestMessage;

    beforeEach(() => {
        link = new ExchangeableLink({linkPort: RECIPIENT_PORT, serverPort: 9999})
    })
    afterEach(() => {
        link.shutdownLink()
        link.removeAllListeners()
    })

    describe('exchange', () => {

        test('should send message ', async (done) => {
            const incomingMessage = makeIncomingMessage(DUMMY_REQUEST_MESSAGE, RECIPIENT_PORT)
            link.on(LinkEvents.EXCHANGE_MSG, d => {
                expect(d).toStrictEqual(incomingMessage)
                done()
            })
            await link.exchange({port: RECIPIENT_PORT, name: 'AnyPeer'}, DUMMY_REQUEST_MESSAGE)
        })

        test('should store request as in flight Request ', async (done) => {
            link.on(LinkEvents.EXCHANGE_MSG, d => {
                expect(link._isInFlight(d.ref)).toBeTruthy()
                done()
            })
            await link.exchange({port: RECIPIENT_PORT, name: 'AnyPeer'}, DUMMY_REQUEST_MESSAGE)
        })

        describe('on ' + LinkEvents.REPLY, () => {

            test('should resolve with message payload', async (done) => {
                let incomingMessage = makeIncomingMessage(DUMMY_REQUEST_MESSAGE, RECIPIENT_PORT)

                // Fake response
                setTimeout(() => {
                    link.emit(LinkEvents.REPLY, incomingMessage)
                }, 1000)

                const poop = await link.exchange({port: RECIPIENT_PORT, name: 'AnyPeer'}, DUMMY_REQUEST_MESSAGE)
                expect(poop).toStrictEqual(incomingMessage)

                done()
            })

            test('should only emit once', async (done) => {

                let msg = {
                    id: 'uniqueId123',
                    payload: {
                        response: true
                    },
                    sender: {port: RECIPIENT_PORT},
                    type: LinkEvents.REPLY
                } as RequestMessage;

                let originalIncomingMessage = makeIncomingMessage(msg, RECIPIENT_PORT)

                // First response
                setTimeout(() => link.emit(LinkEvents.REPLY, originalIncomingMessage), 200)

                // Second response
                setTimeout(() => link.emit(LinkEvents.REPLY, {
                    ...originalIncomingMessage,
                    payload: {
                        invalidPayload: true
                    }
                } as IncomingMessage), 300)

                const res = await link.exchange({port: RECIPIENT_PORT, name: 'AnyPeer'}, msg)
                expect(res).toStrictEqual(originalIncomingMessage)

                done()

            })

            test('should remove request from in flight object ', async (done) => {
                link.on(LinkEvents.EXCHANGE_MSG, d => {
                    link.emit(LinkEvents.REPLY, makeIncomingMessage(d, RECIPIENT_PORT))
                })
                const res = await link.exchange({port: RECIPIENT_PORT, name: 'AnyPeer'}, DUMMY_REQUEST_MESSAGE)
                expect(link._isInFlight(res.ref)).toBeFalsy()
                done()
            })
        })


        describe('on request timeout', () => {

            test('should emit timeout event ', async (done) => {
                link.on(LinkEvents.EXCHANGE_MSG, d => {
                    setTimeout(() => {
                        link.emit(LinkEvents.REPLY, makeIncomingMessage(d, RECIPIENT_PORT))
                    }, 2000)
                })
                link.on(LinkEvents.TIMEOUT, (msg: ErrorMessage) => {
                    expect(msg).toStrictEqual({
                            code: 'NO_REPLY_IN_TIME',
                            msg: {
                                id: 'uniqueId',
                                payload: {request: true},
                                sender: {port: 1337},
                                type: 'exchange_msg'
                            }
                        }
                    )
                    done()
                })
                await link.exchange({port: RECIPIENT_PORT, name: 'AnyPeer'}, DUMMY_REQUEST_MESSAGE);
            })
        })


    })


})


function makeIncomingMessage(msg: RequestMessage, port: number): IncomingMessage {
    return new IncomingMessage(new Buffer(JSON.stringify(msg)), {
        port: port,
        address: 'localhost',
        family: "IPv4",
        size: 1335
    })
}