import {Graphlet} from "../Graphlet";
import {AbstractGraphlet} from "./abstract.graphlet";

export class HttpFacadeGraphlet extends AbstractGraphlet implements Graphlet.IGraphlet {

    constructor(config: { name: string, address?: string, port?: number }) {
        super({
            ...config,
            rootResolver: {},
            source: 'type Query',
            role: Graphlet.Role.FACADE})
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