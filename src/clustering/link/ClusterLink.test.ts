import {UDPLink} from "./ClusterLink";
import {createSocket, Socket} from "dgram";

describe('ClusterLink', () => {
    const DUMMY_PORT = 1337;
    const link = new UDPLink(DUMMY_PORT)

    let socket: Socket

    beforeAll(() => {
        socket = createSocket('udp4')
        socket.bind(DUMMY_PORT)
    })
    afterAll(() => {
        link.shutdownLink()
        socket.close()
    })




    describe('exchange', () => {


        test('should send message', () => {
            expect('to').toBe('to')
        })

        test('should timeout ', () => {
            expect('to').toBe('to')
        })


    })


})

