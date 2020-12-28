const { getInput } = require('../setup');

function createSeat(line) {
    const instructions = line.split('');
    const rowInstructions = instructions.slice(0, 7);
    const columnInstructions = instructions.slice(7);

    const [row] = rowInstructions.reduce(([min, max], instruction) => {
        const delta = (max - min + 1) / 2;
        if (instruction === 'F') {
            return [min, max - delta];
        }

        return [min + delta, max];
    }, [0, 127]);

    const [column] = columnInstructions.reduce(([min, max], instruction) => {
        const delta = (max - min + 1) / 2;
        if (instruction === 'L') {
            return [min, max - delta];
        }

        return [min + delta, max];
    }, [0, 7]);

    const seatId = row * 8 + column;

    return {
        column,
        row,
        seatId,
    };
}

getInput(data => {
    const seats = data.split('\n').map(createSeat);
    const sortedSeats = seats.sort((a, b) => a.seatId - b.seatId);
    const highestSeatId = sortedSeats[sortedSeats.length - 1];
    console.log('[DEBUG]: highestSeatId ::: ', highestSeatId);

    const seatBeforeFreeSeat = sortedSeats.reduce((lastSeat, nextSeat) => {
        if (nextSeat.seatId - lastSeat.seatId !== 1) return lastSeat;
        return nextSeat;
    });
    console.log('[DEBUG]: freeSeatId ::: ', seatBeforeFreeSeat.seatId + 1);
});
