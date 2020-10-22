import {ComManager} from "./transport/ComManager";
import {ResponseMessage, UDPLink} from "./transport/Transport";
import {buildSchema, graphql} from "graphql";

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


app.connectWithPayload({schemaSource: source})
app.onQuery(async msg => {

    console.log('ON QUERY MSG', msg)
    const res =  await graphql(schema, msg.payload.query, root, {}, msg.payload.variables)
    console.log('GQL RES', res)
    return new ResponseMessage(msg.ref, res)
})
// app2.connectWithPayload({greeting: 'YouSuch'})

// setTimeout(() => {
//     app._exchange('TheSecondApp', {greeting: 'dude'})
//         .then(res => console.log('Respojse', res))
//         .catch(e => console.error('Error', e))
// }, 100)





