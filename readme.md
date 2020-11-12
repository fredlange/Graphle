# GrApp -  Microservices as a graph

The idea behind GrApp is to use a dynamic graphql schema as the sole dependency for microservice communication.
Every service is a "component" of the cluster.
Components contributing to the schema is a peer. Peers build and resolve data to the schema.
Components who only reads the schema is a spectator. Spectators can change the schema but should not do so.
They should rather listen for schema changes do things. One example is exposing the schema by http (se demo spectator)
Both peers and spectators are prototypes. Their purpose may change greatly.

## Current state
The current state of GrApp is a POC to showcase potential of dynamic schema and custom UDP links rather than http. There are many many bugs and weird design choices!

## Getting started
There are some demo applications available under `demo` folder
* First start the manager `npm run start:orator`
* App `npm run start:app1:dev`
* App2 `npm run start:app2:dev`
* Spectator `npm run start:spectator:dev`

### The Orator
The orator is the only application with a fixed port. All apps notify the orator of their liveliness and the orator then broadcast that state to all other apps, hence keeping in sync (or so they should be).
### Demo apps
App and app2 are the most simplistic apps to showcase how GrApp is used by an end user
### Spectator
The spectator provided sets up a graphiql instance to be able to use http to query against the flexible schema. The subschemas of the spectator will use UDP.

## Known bugs / Todo
* Orator does not emit even whenever a clients crashes
* Orator only persist state in memory (needs something more)
* Introspection query fills upp the UDP buffer
* Query caching