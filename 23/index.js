const { getInput } = require('../setup');

function printStarCups(cups) {
    const oneIndex = cups.findIndex((val) => val === 1);
    const firstStar = (oneIndex + 1) % cups.length;
    const secondStar = (oneIndex + 2) % cups.length;

    console.log('[DEBUG]: start product ::: ', cups[firstStar] * cups[secondStar]);
}

function printCupsFrom1(cups) {
    const startingIndex = cups.findIndex((val) => val === 1);
    const result = [];
    for (let i = 1; i < 9; i += 1) {
        const nextIndex = (startingIndex + i) % cups.length;
        result.push(cups[nextIndex]);
    }

    console.log('[DEBUG]: cups ::: ', result.join(''));
}

function selectDestination(cups, currentCup) {
    const minValue = 1;
    const maxValue = cups.length + 3;

    let targetValue = currentCup - 1;
    while (true) {
        const targetIndex = cups.findIndex((val) => val === targetValue);
        if (targetIndex !== -1) return targetIndex;
        
        if (targetValue <= minValue) {
            targetValue = maxValue;
        } else {
            targetValue -= 1;
        }
    }
}

function pickThree(cups, currentCupIndex) {
    const pickedCups = [];
    for (let i = 1; i <= 3; i += 1) {
        const nextIndex = (currentCupIndex + i) % cups.length;
        pickedCups.push(cups[nextIndex]);
    }

    return {
        pickedCups,
        remainingCups: cups.filter((val) => !pickedCups.includes(val)),
    }
}

function executeMove(cups, currentCupIndex) {
    const { pickedCups, remainingCups } = pickThree(cups, currentCupIndex);

    const destinationIndex = selectDestination(remainingCups, cups[currentCupIndex]);

    remainingCups.splice(destinationIndex + 1, 0, ...pickedCups);
    return remainingCups;
}

function processVal(val) {
    return parseInt(val, 10);
}

getInput(rawData => {
    const cups = rawData.split('').map(processVal);
    const originalCups = cups.slice(0);

    let cupsState = cups;
    
    let currentCupIndex = 0;
    let currentCup;
    for (let round = 0; round < 100; round += 1) {
        currentCup = cupsState[currentCupIndex];
        cupsState = executeMove(cupsState, currentCupIndex);
        currentCupIndex = (cupsState.findIndex((val) => val === currentCup) + 1) % cupsState.length;
    }

    console.log('[DEBUG]: Part 1');
    printCupsFrom1(cupsState);

    let millionCups = originalCups;
    for (let crabCup = 11; crabCup <= 1000000; crabCup += 1) {
        millionCups.push(crabCup);
    }

    let currentMillionCupIndex = 0;
    let currentMillionCup;
    for (let round = 0; round < 10000000; round += 1) {
        currentMillionCup = millionCups[currentMillionCupIndex];
        millionCups = executeMove(millionCups, currentMillionCupIndex);
        currentMillionCupIndex = (millionCups.findIndex((val) => val === currentMillionCup) + 1) % millionCups.length;
    }

    console.log('[DEBUG]: Part 2');
    printStarCups(millionCups);
});
