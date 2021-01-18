
import {Graphlet} from "../Graphlet";
import {ClusterEvents, ClusterManager} from "../clustering/ClusterManager";
import {VerboseLogging} from "../logging/verbose.logger";
import {ExchangeableLink} from "../clustering/link/ExchangeableLink";
import {ComponentRegistry} from "../clustering/ComponentRegistry";
import {IComponentRegistry} from "../clustering/cluster.registry";
import {ResponseMessage} from "../clustering/link/ClusterLink";

import {GraphQLSchema, createSubschema, stitch, makeExecutableSchema} from "../graphql/schema";
import {graphql, graphqlHTTP} from "../graphql";

export abstract class AbstractGraphlet implements Graphlet.IGraphlet {

    readonly options: Graphlet.Options
    readonly clusterManager: ClusterManager
    readonly _rootResolver: any
    _schema: GraphQLSchema

    protected constructor(opt: Graphlet.Options) {
        this.options = opt

        VerboseLogging.configure({
            name: opt.name
        })

        this._schema = makeExecutableSchema({typeDefs: opt.source})
        this._rootResolver = opt.rootResolver
        this.clusterManager = new ClusterManager({
            appName: opt.name,
            link: new ExchangeableLink({serverPort: 41236}),
            role: opt.role,
            componentRegistry: new ComponentRegistry(opt.name)
        });

        this.clusterManager.connectToCluster({
            appName: opt.name,
            schemaSource: opt.source
        })

        /*
        when the state is rehydrated, restitch the schema
         */
        this.clusterManager.on(ClusterEvents.STATE_REHYDRATED, (payload: IComponentRegistry) => {
            VerboseLogging.info('State rehydrated. Restitching schema', payload)
            payload.getAllComponents().forEach(p => {
                this._schema = stitch(this._schema, createSubschema(p.schema, p.name, this.clusterManager));
                VerboseLogging.info('New schema is set')
            })
        })

        /*
        When a new component is registered, stitch the schema to local schema
         */
        this.clusterManager.on(ClusterEvents.NEW_COMPONENT, (newComponent) => {
            VerboseLogging.info('noticed a new component:', newComponent.name)
            this._schema = stitch(this._schema, createSubschema(newComponent.schemaSource, newComponent.name, this.clusterManager));
            VerboseLogging.info('New schema is set')
        });


        this.clusterManager.respondOnQuery(async msg => {
            VerboseLogging.debug('On Query Message:', msg)
            const res = await graphql(this._schema, msg.payload.query, this._rootResolver, {}, msg.payload.variables)
            VerboseLogging.debug('GQL Response:', res)
            return new ResponseMessage(msg.ref, res)
        })
    }

    protected async query(query: string, variables: any = {}): Promise<any> {
        let executionResult = await graphql(this._schema, query, this._rootResolver, {}, variables);
        VerboseLogging.debug('Execution result:', executionResult)
        return executionResult
    }

    protected makeHttpMiddleware(): (req, res, next) => Promise<void> {
        return (req, res, _) => graphqlHTTP({
            schema: this._schema,
            rootValue: this._rootResolver,
            graphiql: true,
        })(req, res)
    }
}
