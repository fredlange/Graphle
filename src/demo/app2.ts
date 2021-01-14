import {Graphlet} from "../Graphlet";

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

const app = Graphlet
    .joinAsPeer({
        name: 'pooperApp',
        rootResolver: root,
        source: source
    })