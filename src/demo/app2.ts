

// Construct a schema, using GraphQL schema language
import {GrApp} from "../GrApp";

let source = `
type Query {
    pooper: String
    derpderp: String
}
`;

// The root provides a resolver function for each API endpoint
const root = {
    pooper: async () => {
        return 'That is true indeed'
    },
    derpderp: async () => {
        const poop = await app.Q(`{ iHate }`)

        return 'Death to... ' + poop.data.iHate;

    }
};

const app = new GrApp.Peer(
    {
        name: 'pooperApp',
        rootResolver: root,
        source: source
    }
)