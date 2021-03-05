import express from 'express';
import {VerboseLogging} from "../logging/verbose.logger";
import {Graphlet} from "../Graphlet";

const expr = express();
expr.listen(4000, () => {
    expr.use('/graphql',
        Graphlet
            .setupHttpFacade('schemaSpectator', 'localhost', 1337)
            .makeHttpMiddleware());
    VerboseLogging.info('Running a GraphQL API server at http://localhost:4000/graphql')
});