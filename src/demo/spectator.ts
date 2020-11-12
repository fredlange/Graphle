import express from 'express';
import {GrApp} from "../GrApp";
import {VerboseLogging} from "../logging/verbose.logger";


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
const spectator = new GrApp.Spectator({
    name: 'schemaSpectator',
    rootResolver: root,
    source: source
})

const expr = express();
expr.listen(4000, () => {
    expr.use('/graphql', spectator.makeHttpMiddleware());
    VerboseLogging.info('Running a GraphQL API server at http://localhost:4000/graphql')
});