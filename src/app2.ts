import {GrApp} from "./GrApp";


// Construct a schema, using GraphQL schema language
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
        const poop = await app.query(`{ iHate }`)

        return 'Death to... ' + poop.data.iHate;

    }
};

const app = new GrApp({
    name: 'pooperApp',
    rootResolver: root,
    source: source
})





