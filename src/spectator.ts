import express from 'express';
import {graphqlHTTP} from 'express-graphql';
import {buildSchema, GraphQLSchema, print} from 'graphql';

import {stitchSchemas, SubschemaConfig} from 'graphql-tools';
import {ComEvents, ComManager} from "./transport/ComManager";
import {UDPLink} from "./transport/Transport";

const expr = express();

const grapp = new ComManager({
    appName: 'schemaSpectator',
    link: new UDPLink(41236)
})

grapp.connectWithPayload({})

// Construct a schema, using GraphQL schema language
let schema = buildSchema(`
type Query {
    spectator: String
}
`);

// The root provides a resolver function for each API endpoint
const root = {
    spectator: () => {
        return 'IamSpectator!';
    },
};

expr.listen(4000, () => {
    console.log('Running a GraphQL API server at http://localhost:4000/graphql');

    expr.use('/graphql', graphQLDynamicSchema(schema));
});

function graphQLDynamicSchema(initalSchema: GraphQLSchema): (req, res, next) => Promise<void> {
    let _schema = initalSchema;

    grapp.on(ComEvents.STATE_REHYDRATE, (event) => {
        // TODO
    })
    grapp.on(ComEvents.NEW_PEER, (event) => {
        console.log('SPECTATOR NOTICED A NEW COMPONENT');
        console.log('EVENT', event)

        const newSchema = buildSchema(event.schemaSource);
        const newSchema2 = {
            schema: newSchema,
            executor: async ({document, variables}) => {
                const query = print(document);
                let newVar = await grapp._exchange(event.name, {
                    query, variables
                });

                console.log('Executor result', newVar)
                return newVar
            }

        } as SubschemaConfig

        let stitchedSchemas = stitchSchemas(
            {subschemas: [_schema, newSchema2]}
        )

        _schema = stitchedSchemas;
        console.log('NEW SCHEMA SET');
    });

    return (req, res, _) => graphqlHTTP({schema: _schema, rootValue: root, graphiql: true,})(req, res);
}


