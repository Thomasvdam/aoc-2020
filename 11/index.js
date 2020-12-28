const { getInput } = require('../setup');

const NEIGHBOURING_DELTAS = [
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
];

function printFloorplan(floorplan) {
    const formattedFloorplan = floorplan.map((row) => {
        return row.map((seat) => {
            if (!seat) return '.';
            return seat.occupied ? '#' : 'L';
        }).join('');
    }).join('\n');

    console.log(formattedFloorplan);
}

function getOccupiedSeats(floorplan) {
    return floorplan.reduce((acc, row) => {
        return row.reduce((rowAcc, seat) => {
            if (seat?.occupied) return rowAcc + 1;
            return rowAcc;
        }, acc);
    }, 0);
}

function applyMutation(floorplan, mutation) {
    mutation.forEach(({ nextSeatState, x, y }) => {
        floorplan[y][x].occupied = nextSeatState;
    });
}

function determineNextSeatState2(occupied, occupiedNeighbours) {
    if (occupied && occupiedNeighbours >= 5) {
        return false
    } else if (!occupied && occupiedNeighbours === 0) {
        return true
    }

    return occupied;
}

function determineNextSeatState1(occupied, occupiedNeighbours) {
    if (occupied && occupiedNeighbours >= 4) {
        return false
    } else if (!occupied && occupiedNeighbours === 0) {
        return true
    }

    return occupied;
}

function getStateMutation(floorplan, determineNextSeatState) {
    const mutation = [];
    floorplan.forEach((row, y) => {
        return row.forEach((seat, x) => {
            if (!seat) return null;

            const { occupied, neighbours } = seat;
            const occupiedNeighbours = neighbours.reduce((acc, neighbour) => {
                if (neighbour.occupied) return acc + 1;
                return acc;
            }, 0);

            const nextSeatState = determineNextSeatState(occupied, occupiedNeighbours);
            if (nextSeatState === occupied) return;
            mutation.push({ nextSeatState, x, y });
        });
    });

    return mutation;
}

function linkSeats2(floorplan) {
    for (const [y, row] of floorplan.entries()) {
        for (const [x, seat] of row.entries()) {
            if (!seat) continue;
            NEIGHBOURING_DELTAS.forEach(([deltaX, deltaY]) => {
                // Ugly as fuuuuck
                let checkX = x;
                let checkY = y;
                while (true) {
                    checkX += deltaX;
                    checkY += deltaY
                    const neighbour = floorplan[checkY]?.[checkX];
                    // Out of bounds
                    if (neighbour === undefined) break;
                    // First in line of sight
                    if (neighbour) {
                        seat.neighbours.push(neighbour);
                        break;
                    }
                }
            });
        }
    }
}

function linkSeats1(floorplan) {
    for (const [y, row] of floorplan.entries()) {
        for (const [x, seat] of row.entries()) {
            if (!seat) continue;
            NEIGHBOURING_DELTAS.forEach(([deltaX, deltaY]) => {
                const neighbour = floorplan[y + deltaY]?.[x + deltaX];
                if (!neighbour) return;
                seat.neighbours.push(neighbour);
            });
        }
    }
}

function createSeat(char) {
    if (char === '.') return null;

    return {
        occupied: char === '#',
        neighbours: [],
    };
}

function processLine(line) {
    const chars = line.split('');
    return chars.map(createSeat);
}

getInput(data => {
    const floorplan = data.split('\n').map(processLine);
    linkSeats1(floorplan);

    let mutation;
    do {
        mutation = getStateMutation(floorplan, determineNextSeatState1);
        applyMutation(floorplan, mutation);
    } while (mutation.length > 0);

    const occupiedSeats = getOccupiedSeats(floorplan);
    console.log('[DEBUG]: occupiedSeats ::: ', occupiedSeats);

    const floorplan2 = data.split('\n').map(processLine);
    linkSeats2(floorplan2);
    do {
        mutation = getStateMutation(floorplan2, determineNextSeatState2);
        applyMutation(floorplan2, mutation);
    } while (mutation.length > 0);

    const occupiedSeats2 = getOccupiedSeats(floorplan2);
    console.log('[DEBUG]: occupiedSeats2 ::: ', occupiedSeats2);
});
