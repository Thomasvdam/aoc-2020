const { getInput } = require('../setup');

// Could make it prettier by making the dimensional depth variable

function countActiveCubes(wMap) {
    let active = 0;
    for (const [w, zMap] of wMap) {
        for (const [z, yMap] of zMap) {
            for (const [y, xMap] of yMap) {
                for (const [x, cube] of xMap) {
                    if (cube.state) active += 1;
                }
            }
        }
    }

    return active;
}

/** It's a lazily loaded dimension, cubes only exist when observed */
function queryCube(wMap, x, y, z, w, loadNew = false) {
    if (!wMap.has(w)) {
        if (loadNew) {
            wMap.set(w, new Map());
        } else {
            return null;
        }
    }

    const zMap = wMap.get(w);
    if (!zMap.has(z)) {
        if (loadNew) {
            zMap.set(z, new Map());
        } else {
            return null;
        }
    }

    const yMap = zMap.get(z);
    if (!yMap.has(y)) {
        if (loadNew) {
            yMap.set(y, new Map());
        } else {
            return null;
        }
    }

    const xMap = yMap.get(y);
    if (!xMap.has(x)) {
        if (loadNew) {
            xMap.set(x, {
                state: false,
                neighbours: getNeighbours(x, y, z, w),
            });
        } else {
            return null;
        }
    }

    return xMap.get(x);
}

function applyMutation(wMap, { newCubes, switchCubes }) {
    switchCubes.forEach((cube) => {
        cube.state = !cube.state;
    });

    newCubes.forEach((coords) => {
        queryCube(wMap, ...coords, true);
    });
}

function getMutation(wMap) {
    const mutation = {
        newCubes: [],
        switchCubes: [],
    };

    for (const [w, zMap] of wMap) {
        for (const [z, yMap] of zMap) {
            for (const [y, xMap] of yMap) {
                for (const [x, cube] of xMap) {
                    const { state, neighbours } = cube;

                    const activeNeighbours = neighbours.reduce((acc, coords) => {
                        const neighbourCube = queryCube(wMap, ...coords);
                        if (neighbourCube) {
                            if (neighbourCube.state) return acc + 1;
                        } else {
                            mutation.newCubes.push(coords);
                        }
                        return acc;
                    }, 0);

                    if (state) {
                        if (activeNeighbours === 2 || activeNeighbours === 3) {
                            continue;
                        }

                        mutation.switchCubes.push(cube);
                    } else if (activeNeighbours === 3) {
                        mutation.switchCubes.push(cube);
                    }
                }
            }
        }
    }
    return mutation;
}

function getNeighbours(x, y, z, w) {
    const neighbours = [];
    for (let deltaW = -1; deltaW <= 1; deltaW += 1) {
        for (let deltaZ = -1; deltaZ <= 1; deltaZ += 1) {
            for (let deltaY = -1; deltaY <= 1; deltaY += 1) {
                for (let deltaX = -1; deltaX <= 1; deltaX += 1) {
                    const neighbourW = w + deltaW;
                    const neighbourZ = z + deltaZ;
                    const neighbourY = y + deltaY;
                    const neighbourX = x + deltaX;
                    if (neighbourZ === z && neighbourY === y && neighbourX === x && neighbourW === w) continue;
                    neighbours.push([neighbourX, neighbourY, neighbourZ, neighbourW]);
                }
            }
        }
    }
    return neighbours;
}

function processLine(line) {
    return line.split('').map(char => char === '#');
}

getInput(rawData => {
    const data = rawData.split('\n').map(processLine);
    
    const wMap = new Map();
    wMap.set(0, new Map);
    const zMap = wMap.get(0);
    // Populate initial state
    data.forEach((row, y) => {
        if (!zMap.has(0)) zMap.set(0, new Map());
        const yMap = zMap.get(0);

        if (!yMap.has(y)) yMap.set(y, new Map());
        const xMap = yMap.get(y);

        row.forEach((state, x) => {
            const cube = {
                state,
                neighbours: getNeighbours(x, y, 0, 0),
            }
            xMap.set(x, cube);

            cube.neighbours.forEach((coords) => {
                queryCube(wMap, ...coords, true);
            });
        });
    });

    const GAME_LENGTH = 6;
    for (let round = 0; round < GAME_LENGTH; round += 1) {
        const mutation = getMutation(wMap);
        applyMutation(wMap, mutation);
    }

    const activeCubes = countActiveCubes(wMap);
    console.log('[DEBUG]: activeCubes ::: ', activeCubes);
});
