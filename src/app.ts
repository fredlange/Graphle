import {ComManager} from "./transport/ComManager";
import {UDPLink} from "./transport/Transport";

const app = new ComManager({
    appName: 'TheFirstApp',
    link: new UDPLink(41236)
});

const app2 = new ComManager({
    appName: 'TheSecondApp',
    link: new UDPLink(41236)
});


setTimeout(() => {

    app._exchange('TheSecondApp', {greeting: 'dude'})
        .then(res => console.log('Respojse', res))
        .catch(e => console.error('Error', e))


}, 10)





