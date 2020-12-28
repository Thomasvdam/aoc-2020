const { getInput } = require('../setup');

function applyMutations(tileMap, mutations) {
    mutations.forEach((mutation) => {
        const [tileId, state] = mutation;
        tileMap.set(tileId, state);
    });
}

function parseCoords(coordsString) {
    const rawCoords = coordsString.split(',');
    return rawCoords.map((val) => parseInt(val, 10));
}

function addNeighbours(tileMap) {
    for (let [coordsString, value] of tileMap.entries()) {
        // Only tiles that have at least 1 black adjacent need to be considered
        if (!value) continue;

        const neighbours = getNeighbours(coordsString);
        neighbours.forEach((neighbour) => {
            if (tileMap.has(neighbour)) return;
            // All tiles start white
            tileMap.set(neighbour, false);
        });
    }
}

const EVEN_DELTAS = [[-1, 1], [-1, 0], [-1, -1], [0, -1], [1, 0], [0, 1]];
const ODD_DELTAS = [[0, 1], [-1, 0], [0, -1], [1, -1], [1, 0], [1, 1]];
function getNeighbours(coordsString) {
    const [x, y] = parseCoords(coordsString);
    
    const deltas = Math.abs(y) % 2 === 0 ? EVEN_DELTAS : ODD_DELTAS;

    return deltas.map(([xDelta, yDelta]) => {
        return [x + xDelta, y + yDelta].join(',');
    });
}

function getMutations(tileMap) {
    const mutations = [];
    for (let [coordsString, value] of tileMap.entries()) {
        const neighbours = getNeighbours(coordsString);
        const blackNeighbours = neighbours.reduce((acc, neighbour) => {
            if (!tileMap.has(neighbour)) return acc;
            if (tileMap.get(neighbour)) return acc + 1;
            return acc;
        }, 0);

        if (value) {
            if (blackNeighbours === 0 || blackNeighbours > 2) {
                mutations.push([coordsString, false]);
            }
        } else if (!value) {
            if (blackNeighbours === 2) {
                mutations.push([coordsString, true]);
            }
        }
    }

    return mutations;
}

function getXDelta(y, west = false) {
    if (Math.abs(y) % 2 === 0) {
        return west ? 1 : 0;
    }

    return west ? 0 : 1;
}

function getCoords(steps) {
    const coords = [0, 0];
    steps.forEach((step) => {
        switch (step) {
        case 'e':
            coords[0] = coords[0] + 1;
            break;
        case 'w':
            coords[0] = coords[0] - 1;
            break;
        case 'se':
            coords[0] = coords[0] + getXDelta(coords[1]);
            coords[1] = coords[1] - 1;
            break;
        case 'sw':
            coords[0] = coords[0] - getXDelta(coords[1], true);
            coords[1] = coords[1] - 1;
            break;
        case 'nw':
            coords[0] = coords[0] - getXDelta(coords[1], true);
            coords[1] = coords[1] + 1;
            break;
        case 'ne':
            coords[0] = coords[0] + getXDelta(coords[1]);
            coords[1] = coords[1] + 1;
            break;
        default:
            throw new Error('INVALID_STEP');
        }
    });

    return coords;
}

function consolidateDiagonals(stepCounts) {
    const westOverlap = reduceOverlap(stepCounts, 'nw', 'sw');
    stepCounts.w = stepCounts.w + westOverlap;
    const eastOverlap = reduceOverlap(stepCounts, 'ne', 'se');
    stepCounts.e = stepCounts.e + eastOverlap;
}

function reduceOverlap(stepCounts, a, b) {
    const overlap = Math.min(stepCounts[a], stepCounts[b]);
    stepCounts[a] = stepCounts[a] - overlap;
    stepCounts[b] = stepCounts[b] - overlap;

    return overlap;
}

function simplifySteps(steps) {
    const stepCounts = steps.reduce((acc, step) => {;
        acc[step] = acc[step] + 1;
        return acc;
    }, VALID_STEPS.reduce((acc, dir) => { acc[dir] = 0; return acc; }, {}));

    reduceOverlap(stepCounts, 'nw', 'se');
    reduceOverlap(stepCounts, 'sw', 'ne');
    consolidateDiagonals(stepCounts);
    reduceOverlap(stepCounts, 'w', 'e');

    return Object.keys(stepCounts).reduce((acc, stepKey) => {
        const count = stepCounts[stepKey];
        for (let i = 0; i < count; i += 1) {
            acc.push(stepKey);
        }

        return acc;
    }, []);
}

const VALID_STEPS = ['e', 'se', 'sw', 'w', 'nw', 'ne'];
function processLine(line) {
    const steps = [];
    let currentStep = '';
    line.split('').forEach((char) => {
        currentStep += char;
        if (VALID_STEPS.includes(currentStep)) {
            steps.push(currentStep);
            currentStep = '';
        }
    });

    if (currentStep !== '') throw new Error('LEFTOVER_INSTR');

    return steps;
}

getInput(rawData => {
    const data = rawData.split('\n').map(processLine);

    const tileMap = new Map();

    data.map(simplifySteps).forEach((steps) => {
        const coords = getCoords(steps);
        const tileId = coords.join(',');
        if (!tileMap.has(tileId)) {
            tileMap.set(tileId, true);
        } else {
            const prevState = tileMap.get(tileId);
            tileMap.set(tileId, !prevState);
        }
    });

    let blackTiles = 0;
    for (let isBlack of tileMap.values()) {
        if (isBlack) blackTiles += 1;
    }

    console.log('[DEBUG]: Part 1', blackTiles);

    for (let day = 1; day <= 100; day += 1) {
        addNeighbours(tileMap);
        const mutations = getMutations(tileMap);
        applyMutations(tileMap, mutations);
    }

    blackTiles = 0;
    for (let isBlack of tileMap.values()) {
        if (isBlack) blackTiles += 1;
    }

    console.log('[DEBUG]: Part 2', blackTiles);
});
