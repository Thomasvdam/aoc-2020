const { getInput } = require('../setup');

const WINDOW_SIZE = 25;

function findContiguousSum(input, target) {
    for (const [i, numA] of input.entries()) {
        const sumSet = [numA];
        for (const numB of input.slice(i + 1)) {
            sumSet.push(numB);

            const setValue = sumSet.reduce((acc, num) => acc + num);
            if (setValue === target) {
                return sumSet;
            } else if (setValue > target) {
                break;
            }
        }
    }

    throw new Error('END_OF_INPUT');
}

function isValid(window, target) {
    for (const [i, numA] of window.entries()) {
        for (const numB of window.slice(i + 1)) {
            if (numA + numB === target) {
                return true;
            }
        }
    }

    return false;
}

function findInvalidValue(input, windowSize) {
    const window = input.splice(0, windowSize)
    for (const num of input) {
        if (!isValid(window, num)) {
            return num;
        }

        window.shift();
        window.push(num);
    }

    throw new Error('END_OF_INPUT');
}

function processLine(line) {
    return parseInt(line, 10);
}

getInput(data => {
    const numbers = data.split('\n').map(processLine);
    const invalidValue = findInvalidValue([...numbers], WINDOW_SIZE);
    console.log('[DEBUG]: invalidValue ::: ', invalidValue);

    const sumSet = findContiguousSum([...numbers], invalidValue);
    const weakness = Math.min(...sumSet) + Math.max(...sumSet);
    console.log('[DEBUG]: weakness ::: ', weakness);
});
