import {stitchSchemas, SubschemaConfig} from "graphql-tools";
import {buildSchema, GraphQLSchema, print} from "graphql";
import {ClusterManager} from "../clustering/ClusterManager";


export function createSubschema(source: string, remoteName: string, clusterManager: ClusterManager): SubschemaConfig {
    return {
        schema: buildSchema(source),
        executor: async ({document, variables}) =>
            await clusterManager._exchange(remoteName, {
                query: print(document), variables
            })

    } as SubschemaConfig
}

export function stitch(...schemas): GraphQLSchema {
    return stitchSchemas(
        {subschemas: schemas}
    )
}