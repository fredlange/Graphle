import {ComEvents, ComManager} from "./transport/ComManager";
import {ResponseMessage, StateRehydratePayload, UDPLink} from "./transport/Transport";
import {buildSchema, graphql} from "graphql";
import {ComponentRoles} from "./manager/app";
import {createSubschema, stitch} from "./graphql/schema";

const comManager = new ComManager({
    appName: 'theFirstApp',
    link: new UDPLink(41236),
    role: ComponentRoles.PEER
});

// Construct a schema, using GraphQL schema language
let source = `
type Query {
    iHate: String
}
`;
let schema = buildSchema(source);

// The root provides a resolver function for each API endpoint
const root = {
    iHate: () => {
        return 'Gessle who else?!';
    },
};


comManager.connectWithPayload({schemaSource: source})
comManager.onQuery(async msg => {

    let _schema = schema;

    comManager.on(ComEvents.STATE_REHYDRATE, (payload: StateRehydratePayload[]) => {
        console.log('SPECTATOR REHYDRATES STATE', payload);
        payload.forEach(p => {
            _schema = stitch(_schema, createSubschema(p.state.schemaSource, p.name, comManager));
            console.log('NEW SCHEMA SET');
        })
    })
    comManager.on(ComEvents.NEW_PEER, (event) => {
        console.log('SPECTATOR NOTICED A NEW COMPONENT');
        console.log('EVENT', event)
        _schema = stitch(_schema, createSubschema(event.schemaSource, event.name, comManager));
        console.log('NEW SCHEMA SET');
    });

    console.log('ON QUERY MSG', msg)
    const res =  await graphql(schema, msg.payload.query, root, {}, msg.payload.variables)
    console.log('GQL RES', res)
    return new ResponseMessage(msg.ref, res)
})





