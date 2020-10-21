import {ComManager} from "./transport/ComManager";
import {UDPLink} from "./transport/Transport";

const app = new ComManager({
    appName: name,
    link: new UDPLink(41236)
});

app._exchange('Poop', {
    hello: 'dude'
}).then(
    res => console.log('Respojse', res)
).catch(
    e => console.error('Error', e)
)