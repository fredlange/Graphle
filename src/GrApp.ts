import {ClusterEvents, ClusterManager, ComponentRoles} from "./clustering/ClusterManager";
import {ResponseMessage} from "./clustering/link/ClusterLink";
import {buildSchema, graphql, GraphQLSchema} from "graphql";
import {createSubschema, stitch} from "./graphql/schema";
import {graphqlHTTP} from "express-graphql";
import {ExchangeableLink} from "./clustering/link/ExchangeableLink";
import {ComponentRegistry} from "./clustering/ComponentRegistry";
import {IComponentRegistry} from "./clustering/cluster.registry";

export namespace GrApp {

    interface ComponentOptions {
        name: string
        source: string
        rootResolver: any
        role: ComponentRoles
    }

    interface IComponent {
        readonly options: ComponentOptions
        readonly clusterManager: ClusterManager
        readonly _rootResolver: any
        _schema: GraphQLSchema
    }

    abstract class Component implements IComponent {

        readonly options: ComponentOptions
        readonly clusterManager: ClusterManager
        readonly _rootResolver: any
        _schema: GraphQLSchema

        protected constructor(opt: ComponentOptions) {
            this.options = opt

            this._schema = buildSchema(opt.source);
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
                console.log('State rehydrated. Restitching schema', payload);
                payload.getAllComponents().forEach(p => {
                    this._schema = stitch(this._schema, createSubschema(p.schema, p.name, this.clusterManager));
                    console.log('NEW SCHEMA SET');
                })
            })

            /*
            When a new component is registered, stitch the schema to local schema
             */
            this.clusterManager.on(ClusterEvents.NEW_COMPONENT, (newComponent) => {
                console.log(this.options.name, 'noticed a new component:', newComponent.name);
                this._schema = stitch(this._schema, createSubschema(newComponent.schemaSource, newComponent.name, this.clusterManager));
                console.log('NEW SCHEMA SET');
            });


            this.clusterManager.respondOnQuery(async msg => {


                console.log('ON QUERY MSG', msg)
                const res = await graphql(this._schema, msg.payload.query, this._rootResolver, {}, msg.payload.variables)
                console.log('GQL RES', res)
                return new ResponseMessage(msg.ref, res)
            })
        }

        protected async query(query: string, variables: any = {}): Promise<any> {
            let executionResult = await graphql(this._schema, query, this._rootResolver, {}, variables);
            console.log('ex res', executionResult)
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

    export class Peer extends Component implements IComponent {

        constructor(config: { name: string, source: string, rootResolver: any }) {
            super({...config, role: ComponentRoles.PEER})
        }

        Q(query: string, variables: any = {}): Promise<any> {
            return super.query(query, variables)
        }
    }

    export class Spectator extends Component implements IComponent {

        constructor(config: { name: string, source: string, rootResolver: any }) {
            super({...config, role: ComponentRoles.SPECTATOR})
        }

        /**
         * Spectate events in the app and do things
         * TODO Implement
         */
        on() {
        }

        makeHttpMiddleware(): (req, res, next) => Promise<void> {
            return super.makeHttpMiddleware();
        }

    }

}



