const { getInput } = require('../setup');

function readNumbers(numbers, rounds, state = new Map()) {
    numbers.forEach((number, index) => {
        const prev = state.get(number);
        if (prev) {
            prev.secondToLastTurn = state[number].lastTurn;
            prev.lastTurn = index + 1;
            return;
        }

        state.set(number, {
            number,
            lastTurn: index + 1,
        });
    });

    let lastRound = state.get(numbers[numbers.length - 1]);
    for (let round = numbers.length + 1; round <= rounds; round += 1) {
        const { secondToLastTurn, lastTurn } = lastRound;
        let thisRound;

        const target = secondToLastTurn ? lastTurn - secondToLastTurn : 0;
        thisRound = state.get(target);
        if (thisRound) {
            thisRound.secondToLastTurn = thisRound.lastTurn;
            thisRound.lastTurn = round;
        } else {
            thisRound = {
                number: target,
                lastTurn: round,
            };
            state.set(target, thisRound);
        }

        lastRound = thisRound;
    }

    return lastRound;
}

getInput(rawData => {
    const data = rawData.split(',').map((val) => parseInt(val, 10));
    const lastRound = readNumbers(data, 30000000);
    console.log('[DEBUG]: lastRound ::: ', lastRound);
});
