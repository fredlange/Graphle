import {ComManager} from "./transport/ComManager";
import {UDPLink} from "./transport/Transport";
import {buildSchema, graphql, introspectionFromSchema} from "graphql";

const app = new ComManager({
    appName: 'theFirstApp',
    link: new UDPLink(41236)
});

// const app2 = new ComManager({
//     appName: 'TheSecondApp',
//     link: new UDPLink(41236)
// });

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



// const gql = graphql(schema, '', root)

let schemaIntrospection = introspectionFromSchema(schema);
app.connectWithPayload({schemaSource: source})
// app2.connectWithPayload({greeting: 'YouSuch'})

// setTimeout(() => {
//     app._exchange('TheSecondApp', {greeting: 'dude'})
//         .then(res => console.log('Respojse', res))
//         .catch(e => console.error('Error', e))
// }, 100)





