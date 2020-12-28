const { getInput } = require('../setup');

function getPaths(adapters) {
    const current = adapters[0];
    const lookAhead = adapters.slice(1, 4);
    
    if (lookAhead[0] === undefined) return 1;

    let options = 0
    for (const [i, adapter] of lookAhead.entries()) {
        const delta = adapter - current
        if (delta > 3) continue;

        options += getPaths(adapters.slice(i + 1));
    }

    return options
}

function getAdapterJumps(scope, adapter) {
    const jump = Math.abs(scope._current - adapter);

    scope[jump] = scope[jump] ? scope[jump] + 1 : 1;
    scope._current = adapter;

    return scope;
}

getInput(data => {
    const adapters = data.split('\n').map(val => parseInt(val, 10));
    const sortedAdapters = adapters.sort((a, b) => a - b);
    const deviceAdapter = sortedAdapters[sortedAdapters.length - 1] + 3;
    sortedAdapters.push(deviceAdapter);

    const adapterJumps = sortedAdapters.reduce(getAdapterJumps, {
        _current: 0,
    });

    const answer1 = adapterJumps[1] * adapterJumps[3];
    console.log('[DEBUG]: answer1 ::: ', answer1);

    // sortedAdapters.pop();
    const reversedAdapters = sortedAdapters.reverse();
    // Someone smarter than me realised that if you work backwards it's a lot easier.
    // If X leads to the end, then any Y that leads to X leads to the end
    const routes = {};
    reversedAdapters.forEach((val, index) => {
        if (index === 0) {
            routes[val] = 1;
            return;
        }

        let routeCount = 0;
        for (let x = val; x <= val + 3; x += 1) {
            const prevRoutes = routes[x];
            if (prevRoutes) routeCount += prevRoutes;
        }

        routes[val] = routeCount;
    });

    const arrangements = [1,2,3].reduce((acc, startingAdapter) => {
        return acc + (routes[startingAdapter] || 0);
    }, 0);

    console.log('[DEBUG]: arrangements ::: ', arrangements);
});
