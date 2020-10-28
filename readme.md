# GrApp -  Microservices as a graph

The idea behind GrApp is to use a dynamic graphql schema as the sole dependency for microservice communication.
Every service is considered a "component" of the graph, extending and building the graph. Components contributing to the schema is known as a peer. Components who only reads the schema is known as a spectator.

## Current state
The current state of GrApp is a POC to showcase potential of dynamic schema and custom UDP links rather than http. There are many many bugs and weird design choices!

## Getting started
First start the manager `npm run start:manager`
There are some demo applications available under `demo` folder
* App `npm run start:dev`
* App2 `npm run start2:dev`
* Spectator `npm run start:spectator`

### The manager
The manager is the only application with a fixed port. All apps notify the manager of their liveliness and the manager then broadcast that state to all other apps, hence keeping in sync (or so they should be).
### Demo apps
App and app2 are the most simplistic apps to showcase how GrApp is used by an end user
### Spectator
The spectator provided sets up a graphiql instance to be able to use http to query against the flexible schema. The subschemas of the spectator will use UDP.

## Known bugs / Todo
* Manager does not emit some event whenever a client shuts down
* Manager does not emot even whenever a clients crashes
* Manager only persist state in memory (needs something more)
* Introspection query fills upp the UDP buffer
* Ping does not seem to sync request IDs 