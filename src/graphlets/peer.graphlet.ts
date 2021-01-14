import {AbstractGraphlet} from "./abstract.graphlet";
import {Graphlet} from "../Graphlet";

export class PeerGraphlet extends AbstractGraphlet implements Graphlet.IGraphlet {

    constructor(opt: Graphlet.Options) {
        super(opt)
    }

    Q(query: string, variables: any = {}): Promise<any> {
        return super.query(query, variables)
    }
}