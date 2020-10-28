import {ComEvents, ComManager} from "./transport/ComManager";
import {ResponseMessage, StateRehydratePayload, UDPLink} from "./transport/Transport";
import {ComponentRoles} from "./manager/app";
import {buildSchema, graphql, GraphQLSchema} from "graphql";
import {createSubschema, stitch} from "./graphql/schema";
import {graphqlHTTP} from "express-graphql";

export namespace GrApp {

    interface ComponentOptions {
        name: string
        source: string
        rootResolver: any
        role: ComponentRoles
    }

    interface IComponent {
        readonly options: ComponentOptions
        readonly comManager: ComManager
        readonly _rootResolver: any
        _schema: GraphQLSchema
    }

    abstract class Component implements IComponent {

        readonly options: ComponentOptions
        readonly comManager: ComManager
        readonly _rootResolver: any
        _schema: GraphQLSchema

        protected constructor(opt: ComponentOptions) {
            this.options = opt

            this._schema = buildSchema(opt.source);
            this._rootResolver = opt.rootResolver
            this.comManager = new ComManager({
                appName: opt.name,
                link: new UDPLink(41236),
                role: opt.role
            });

            this.comManager.connectWithPayload({schemaSource: opt.source})

            this.comManager.on(ComEvents.STATE_REHYDRATE, (payload: StateRehydratePayload[]) => {
                console.log('PEER REHYDRATES STATE', payload);
                payload.forEach(p => {
                    this._schema = stitch(this._schema, createSubschema(p.state.schemaSource, p.name, this.comManager));
                    console.log('NEW SCHEMA SET');
                })
            })
            this.comManager.on(ComEvents.NEW_PEER, (event) => {
                console.log('SPECTATOR NOTICED A NEW COMPONENT');
                console.log('EVENT', event)
                this._schema = stitch(this._schema, createSubschema(event.schemaSource, event.name, this.comManager));
                console.log('NEW SCHEMA SET');
            });


            this.comManager.respondOnQuery(async msg => {


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
        on() {}

        makeHttpMiddleware(): (req, res, next) => Promise<void> {
            return super.makeHttpMiddleware();
        }

    }

}



