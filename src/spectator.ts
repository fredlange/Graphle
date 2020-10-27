import express from 'express';
import {graphqlHTTP} from 'express-graphql';
import {buildSchema, GraphQLSchema, print} from 'graphql';

import {stitchSchemas, SubschemaConfig} from 'graphql-tools';
import {ComEvents, ComManager} from "./transport/ComManager";
import {UDPLink} from "./transport/Transport";
import {ComponentRoles} from "./manager/app";

const expr = express();

const comManager = new ComManager({
    appName: 'schemaSpectator',
    link: new UDPLink(41236),
    role: ComponentRoles.SPECTATOR
})

comManager.connectWithPayload({})

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

    expr.use('/graphql', graphQLHttpDynamicSchema(schema));
});

interface StateRehydratePayload {
    name: string
    state: {
        schemaSource: string
    }
}

function graphQLHttpDynamicSchema(initalSchema: GraphQLSchema): (req, res, next) => Promise<void> {
    let _schema = initalSchema;

    comManager.on(ComEvents.STATE_REHYDRATE, (payload: StateRehydratePayload[]) => {
        console.log('SPECTATOR REHYDRATES STATE', payload);
        payload.forEach(p => {
            _schema = stitch(_schema, createSubschema(p.state.schemaSource, p.name));
            console.log('NEW SCHEMA SET');
        })
    })
    comManager.on(ComEvents.NEW_PEER, (event) => {
        console.log('SPECTATOR NOTICED A NEW COMPONENT');
        console.log('EVENT', event)
        _schema = stitch(_schema, createSubschema(event.schemaSource, event.name));
        console.log('NEW SCHEMA SET');
    });

    return (req, res, _) => graphqlHTTP({schema: _schema, rootValue: root, graphiql: true,})(req, res);
}

function createSubschema(source: string, remoteName: string): SubschemaConfig {
    return {
        schema: buildSchema(source),
        executor: async ({document, variables}) =>
            await comManager._exchange(remoteName, {
                query: print(document), variables
            })

    } as SubschemaConfig
}

function stitch(...schemas): GraphQLSchema {
    return stitchSchemas(
        {subschemas: schemas}
    )
}