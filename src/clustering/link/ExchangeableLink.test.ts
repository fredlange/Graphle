import { IncomingMessage, LinkEvents, RequestMessage } from './ClusterLink';
import { ExchangeableLink, RequestTimeoutError } from './ExchangeableLink';

describe('ExchangeableLink', () => {
  const RECIPIENT_PORT = 1337;
  let link: ExchangeableLink;
  const DUMMY_REQUEST_MESSAGE = {
    id: 'uniqueId',
    payload: {
      request: true,
    },
    sender: { port: RECIPIENT_PORT },
    type: LinkEvents.EXCHANGE_MSG,
  } as RequestMessage;

  beforeEach(() => {
    link = new ExchangeableLink({
      node: {
        port: RECIPIENT_PORT,
      },
      bootstrapPort: 9999,
    });
  });

  afterEach(() => {
    link.shutdownLink();
    link.removeAllListeners();
    // link.removeAllListeners(LinkEvents.EXCHANGE_MSG)
  });

  describe('exchange', () => {
    test('should send message ', async (done) => {
      const incomingMessage = makeIncomingMessage(
        DUMMY_REQUEST_MESSAGE,
        RECIPIENT_PORT
      );
      link.on(LinkEvents.EXCHANGE_MSG, (d) => {
        expect(d).toStrictEqual(incomingMessage);
        done();
      });
      await link.exchange(RECIPIENT_PORT, DUMMY_REQUEST_MESSAGE);
    });

    test('should store request as in flight Request ', async (done) => {
      link.on(LinkEvents.EXCHANGE_MSG, (d) => {
        expect(link._isInFlight(d.ref)).toBeTruthy();
        done();
      });
      await link.exchange(RECIPIENT_PORT, DUMMY_REQUEST_MESSAGE);
    });

    describe('on ' + LinkEvents.REPLY, () => {
      test('should resolve with message payload', async (done) => {
        let incomingMessage = makeIncomingMessage(
          DUMMY_REQUEST_MESSAGE,
          RECIPIENT_PORT
        );

        // Fake response
        setTimeout(() => {
          link.emit(LinkEvents.REPLY, incomingMessage);
        }, 1000);

        link.exchange(RECIPIENT_PORT, DUMMY_REQUEST_MESSAGE).then((res) => {
          expect(res).toStrictEqual(incomingMessage.payload);
          done();
        });
      });

      test('should only emit once', async (done) => {
        let msg = {
          id: 'uniqueId123',
          payload: {
            response: true,
          },
          sender: { port: RECIPIENT_PORT },
          type: LinkEvents.REPLY,
        } as RequestMessage;

        let originalIncomingMessage = makeIncomingMessage(msg, RECIPIENT_PORT);

        // First response
        setTimeout(
          () => link.emit(LinkEvents.REPLY, originalIncomingMessage),
          200
        );

        // Second response
        setTimeout(
          () =>
            link.emit(LinkEvents.REPLY, {
              ...originalIncomingMessage,
              payload: {
                invalidPayload: true,
              },
            } as IncomingMessage),
          300
        );

        const res = await link.exchange(RECIPIENT_PORT, msg);
        expect(res).toStrictEqual(originalIncomingMessage.payload);

        done();
      });

      test('should remove request from in flight object ', async (done) => {
        link.on(LinkEvents.EXCHANGE_MSG, (d) => {
          link.emit(LinkEvents.REPLY, makeIncomingMessage(d, RECIPIENT_PORT));
        });
        const res = await link.exchange(RECIPIENT_PORT, DUMMY_REQUEST_MESSAGE);
        expect(link._isInFlight(res.ref)).toBeFalsy();
        done();
      });
    });

    describe('on request timeout', () => {
      test('should emit timeout event ', (done) => {
        link.on(LinkEvents.EXCHANGE_MSG, (d) => {
          setTimeout(() => {
            link.emit(LinkEvents.REPLY, makeIncomingMessage(d, RECIPIENT_PORT));
          }, 2000);
        });
        link
          .exchange(RECIPIENT_PORT, DUMMY_REQUEST_MESSAGE)
          .catch((e) => {
            expect(e).toStrictEqual(
              new RequestTimeoutError(DUMMY_REQUEST_MESSAGE.id)
            );
          })
          .then(done);
      });
    });
  });
});

function makeIncomingMessage(
  msg: RequestMessage,
  port: number
): IncomingMessage {
  return new IncomingMessage(new Buffer(JSON.stringify(msg)), {
    port: port,
    address: 'localhost',
    family: 'IPv4',
    size: 1335,
  });
}
