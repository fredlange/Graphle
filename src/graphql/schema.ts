import {stitchSchemas, SubschemaConfig} from "graphql-tools";
import {buildSchema, GraphQLSchema, print} from "graphql";
import {ComManager} from "../transport/ComManager";


export function createSubschema(source: string, remoteName: string, coms: ComManager): SubschemaConfig {
    return {
        schema: buildSchema(source),
        executor: async ({document, variables}) =>
            await coms._exchange(remoteName, {
                query: print(document), variables
            })

    } as SubschemaConfig
}

export function stitch(...schemas): GraphQLSchema {
    return stitchSchemas(
        {subschemas: schemas}
    )
}