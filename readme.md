# Graphle -  Microservices as a graph

The idea behind Graphle is to use a dynamic graphql schema as the sole dependency for microservice communication.
Every service is a component or "Graphlet" of the cluster.
Graphlet contributing to the schema is a peer. Peers build and resolve data to the schema.

Facades are used to expose the schema to the outside world, for instance by Http. There is a HttpFacade provided that will expose the schema thru http and with Graphiql active.

## Getting started
`npm install @graphle/graphlet`

You always need an orator in your project
```javascript
import {Orator} from "@graphle/graphlet/orator/Orator";
const orator = new Orator()
```
Then you add graphlets using:
```javascript
import {Graphlet} from "@graphle/graphlet";
export const app = Graphlet.joinAsPeer({
    name: 'my-graphlet',
    source: `type Query {
        example: String
    }`,
    rootResolver: {
        example: () => 'Example'
    }      
})
```
This will create a schema containing example, as well as the resolver function for example.
In some other graphlet you can query:


```javascript
import {Graphlet} from "@graphle/graphlet";
export const app = Graphlet.joinAsPeer({
    name: 'my-other-graphlet',
    source: `type Query {
        queryGraphlet: String
    }`,
    rootResolver: {
        queryGraphlet: async () => await app.Q('{example}')
    }      
})
```
This will create a second graphlet with a single resolver that uses example for its resolution. This way all dependencies are always pointing towards the schema.
The complete schema for all graphlets in this example would be:
```graphql
type Query {
    example: String
    queryGraphlet: String
}
```
The schema can be introspected and seen with Graphiql by creating another graphlet:
```javascript
import express from 'express';
import { Graphlet } from '@graphle/graphlet';
import {VerboseLogging} from "@graphle/graphlet/logging/verbose.logger";

const app = Graphlet.setupHttpFacade('http-facade')

const app = express();
app.listen(4000, () => {
    app.use('/graphql', app.makeHttpMiddleware());
    VerboseLogging.info('Running a GraphQL API server at http://localhost:4000/graphql')
});
```

[Graphle Demo](https://github.com/fredlange/Graphle-Demo) repo will be the main repo to showcase how Graphle can be used to build your application.

There are some demo applications available under `demo` folder. These are mainly used for development as experimental playgrounds

## Current state
The current state of Graphle is a POC to showcase potential of dynamic schema and custom UDP links rather than http. There are many many bugs and weird design choices!

## Overview
### Graphlets
Graphlets are the components or modules that make up the application. Graphlets talk to each other thru graphql and links. 
Graphlets require a schema and resolver functions as any graphql implementation do. 
### Orator
The orator is currently acting as a broadcasting agent that will remember all other graphlets and make sure they all are notified whenever the cluster changes state.
### UDP protocol
Http is an overhead for graphql and one ambition of the Graphle project is to provide a essentials only version of UDP as transport layer. 
This goal is to make the overhead small enough for a graphlet to be very small. By doing so we hope to encourage small specialized graphlets rather than bigger ones for the simple reason of keeping internal communication fast.
The custom protocol currently support queries only but subscriptions will be supported soon.

## Known bugs / Todo
* Orator does not emit even whenever a clients crashes
* Orator only persist state in memory (needs something more)
* Introspection query fills upp the UDP buffer
* Query caching