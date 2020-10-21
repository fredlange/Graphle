import {ComManager} from "./ComManager";
import {UDPLink} from "./Transport";

export function createDummyApp(name, delayCreationBy) {
    setTimeout(async () => {
        console.log('Creating app with name', name)
        let grAPP = new ComManager({
            appName: name,
            link: new UDPLink(41236)
        });


        if (name == 'AppOne') {

            setTimeout(async () => {

                const res1 = await grAPP._exchange('AppTwo', {
                    greeting: 'HELLLOOOOO'
                })
                console.log('Response from AppTwo, HELLOOO', res1)


            }, 2000)

            setTimeout(async () => {
                const res2 = await grAPP._exchange('AppTwo', {
                    greeting: 'FUUUU'
                })

                console.log('Response from AppTwo, FUUU', res2)

            }, 1000)


        }

    }, delayCreationBy)


}



/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}