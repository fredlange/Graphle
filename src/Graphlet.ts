import {ClusterManager} from "./clustering/ClusterManager";
import {GraphQLSchema} from "graphql";
import {PeerGraphlet} from "./graphlets/peer.graphlet";
import {HttpFacadeGraphlet} from "./graphlets/http-facade.graphlet";

export namespace Graphlet {

    interface PeerOptions {
        name: string
        source: string
        rootResolver: any
        address?: string
        port?: number
    }

    export interface Options {
        name: string
        source: string
        rootResolver: any
        role: Role
        address?: string
        port?: number
    }

    export enum Role {
        MANAGER = 'manager',
        PEER = 'peer',
        FACADE = 'facade'
    }

    export interface IGraphlet {
        readonly options: Options
        readonly clusterManager: ClusterManager
        readonly _rootResolver: any
        _schema: GraphQLSchema
    }

    export function joinAsPeer(opt: PeerOptions): PeerGraphlet {
        return new PeerGraphlet({
            ...opt,
            role: Role.PEER
        })
    }

    export function setupHttpFacade(name: string, address?: string, port?: number): HttpFacadeGraphlet {
        return new HttpFacadeGraphlet({
            name: name,
            address: address,
            port: port
        })
    }


}



