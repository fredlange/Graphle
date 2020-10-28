import express from 'express';
import {GrApp} from "../GrApp";


// Construct a schema, using GraphQL schema language
let source = `
type Query {
    spectator: String
}
`;

const root = {
    spectator: () => {
        return 'IamSpectator!';
    },
};
const spectator = new GrApp({
    name: 'schemaSpectator',
    rootResolver: root,
    source: source
})

const expr = express();
expr.listen(4000, () => {
    console.log('Running a GraphQL API server at http://localhost:4000/graphql');
    expr.use('/graphql', spectator.makeHttpMiddleware());
});