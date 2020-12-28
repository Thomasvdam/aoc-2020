const { getInput } = require('../setup');

// Used a less elegant solution I stole first, tried to rewrite it using maths
// but turns out I'm dumb and on't really understand it.
function egcd(a, b) {
    let x = 0; 
    let y = 1;
    let u = 1;
    let v = 0;
    let quotient;
    let remainder;
    let m;
    let n;

    while (a !== 0) {
        quotient = Math.floor(b / a);
        remainder = b % a;
        m = x - u * quotient;
        n = y - v * quotient;
        b = a;
        a = remainder;
        x = u;
        y = v;
        u = m;
        v = n;
    }

    return { gcd: b, x, y }
}

function getSequentialDepartureTime(busTimeslots) {
    const totalProduct = busTimeslots.reduce((acc, bus) => {
        return acc * bus.id;
    }, 1);

    const productsPerId = busTimeslots.map((bus) => {
        return totalProduct / bus.id;
    });

    const modularMultiplicativeInverses = productsPerId.map((productPerId, index) => {
        const { id } = busTimeslots[index];
        const { x } = egcd(productPerId, id);
        return id + x;
    });

    const total = busTimeslots.reduce((acc, bus, index) => {
        const { remainder } = bus;
        const productPerId = productsPerId[index];
        const mmi = modularMultiplicativeInverses[index];
        
        console.log('[DEBUG]: (remainder * productPerId * mmi) ::: ', remainder, productPerId, mmi);
        console.log('[DEBUG]: (remainder * productPerId * mmi) ::: ', (remainder * productPerId * mmi));
        return acc + (remainder * productPerId * mmi);
    }, 0);

    const cycle = total % totalProduct;
    const maxId = Math.max(...busTimeslots.map(bus => bus.id));
    if (cycle > maxId) {
        return totalProduct - cycle;
    }
    return cycle;
}

function processTimeslots(id, index) {
    return {
        id: id !== 'x' ? parseInt(id, 10) : null,
        remainder: index,
    };
}

function createGetWaitTime(departureTime) {
    return function getWaitTime(busInterval) {
        return busInterval - (departureTime % busInterval);
    }
}

function processBusses(id) {
    if (id === 'x') return null;
    return parseInt(id, 10);
}

getInput(rawData => {
    const lines = rawData.split('\n');
    const departureTime = parseInt(lines[0], 10);
    const busIds = lines[1].split(',').map(processBusses).filter(Boolean);

    const getWaitTime = createGetWaitTime(departureTime);
    const waitTimes = busIds.map(getWaitTime);

    const minWaitTime = Math.min(...waitTimes);
    const minWaitTimeIndex = waitTimes.indexOf(minWaitTime);
    const shortestWaitBus = busIds[minWaitTimeIndex];
    console.log('[DEBUG]: minWaitTime * shortestWaitBus ::: ', minWaitTime * shortestWaitBus);

    const busTimeslots = lines[1].split(',').map(processTimeslots).filter((bus) => bus.id !== null);
    const sequentialDepartureTime = getSequentialDepartureTime(busTimeslots);
    console.log('[DEBUG]: sequentialDepartureTime ::: ', sequentialDepartureTime);
});
