import {Graphlet} from "../Graphlet";

let source = `
type Query {
    iHate: String
    seriousHatred: String
}
`;

// The root provides a resolver function for each API endpoint
const root = {
    iHate: async () => {
        return 'Gesle!!'
    },
    seriousHatred: async () => {
        const poop = await app.Q(`{ iHate }`)
        console.log('poop', poop)
        return 'ARGH ' + poop.data.iHate;

    }
};
const app = Graphlet.joinAsPeer({
    name: 'theFirstApp',
    source: source,
    rootResolver: root
})
