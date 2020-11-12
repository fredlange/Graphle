import {Orator} from "../clustering/orator/Orator";
import {VerboseLogging} from "../logging/verbose.logger";

VerboseLogging.configure({
    name: 'Orator'
})
const orator = new Orator()