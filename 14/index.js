const { getInput } = require('../setup');

function getTotalMemoryValue(state) {
    return Object.keys(state).reduce((acc, key) => {
        if (key === '_currentMasks') return acc;

        return acc + state[key];
    }, BigInt(0));
}

function executeInstructions1(instructions, state = {}) {
    return instructions.reduce((state, instruction) => {
        if (instruction.isMask) {
            state._currentMasks = instruction.masks;
            return state;
        }

        const { addr, val } = instruction;
        const { _currentMasks: { oneMask, zeroMask } } = state;

        const maskedVal = (val | oneMask) & zeroMask;
        state[addr] = maskedVal;
        return state;
    }, state);
}

function executeInstructions2(instructions, state = {}) {
    return instructions.reduce((state, instruction) => {
        if (instruction.isMask) {
            state._currentMasks = instruction.masks;
            return state;
        }

        const { addr, val } = instruction;
        const { _currentMasks: masksList } = state;

        masksList.forEach(masks => {
            const { oneMask, zeroMask } = masks;
            const maskedAddr = (addr | oneMask) & zeroMask;
            state[maskedAddr] = val;
        });

        return state;
    }, state);
}

function createMasks(rawMask) {
    const oneMask = BigInt(parseInt(rawMask.replace(/[X]/g, '0'), 2));
    const zeroMask = BigInt(parseInt(rawMask.replace(/[X10]/g, (val) => {
        switch (val) {
        case 'X':
            return '0';
        case '1':
            return '0';
        case '0':
            return '1';
        default:
            throw new Error('INVALID_MASK');
        }
    }), 2));

    return {
        oneMask,
        zeroMask: ~zeroMask,
    };
}

const maskRegex = /mask = (\S+)/;
function processMask1(line) {
    const [, rawMask] = maskRegex.exec(line);

    return {
        isMask: true,
        masks: createMasks(rawMask),
    };
}

function getMaskValues(char) {
    switch (char) {
    case '1':
        return ['1'];
    case '0':
        return ['X'];
    case 'X':
        return ['0', '1'];
    default:
        throw new Error('INVALID_MASK');
    }
}

function processMask2(line) {
    const [, rawMask] = maskRegex.exec(line);

    const masks = rawMask.split('').reduce((acc, char) => {
        const values = getMaskValues(char);

        return values.map(val => {
            return acc.map(mask => mask.concat(val));
        }).reduce((newAcc, newMasks) => newAcc.concat(newMasks));

    }, [[]]).map(newMask => newMask.join(''));

    return {
        masks: masks.map(createMasks),
        isMask: true,
    };
}

const memRegex = /mem\[(\d+)\] = (\d+)/;
function processMem(line) {
    const [, rawAddr, rawVal] = memRegex.exec(line);
    return {
        addr: BigInt(rawAddr),
        val: BigInt(rawVal),
        isMask: false,
    };
}

function processLine1(line) {
    if (line.startsWith('mask')) {
        return processMask1(line);
    }

    return processMem(line);
}

function processLine2(line) {
    if (line.startsWith('mask')) {
        return processMask2(line);
    }

    return processMem(line);
}

getInput(rawData => {
    const instructions1 = rawData.split('\n').map(processLine1);
    const state1 = executeInstructions1(instructions1);
    const totalMemoryValue1 = getTotalMemoryValue(state1);
    console.log('[DEBUG]: totalMemoryValue1 ::: ', totalMemoryValue1);

    const instructions2 = rawData.split('\n').map(processLine2);
    const state2 = executeInstructions2(instructions2);
    const totalMemoryValue2 = getTotalMemoryValue(state2);
    console.log('[DEBUG]: totalMemoryValue2 ::: ', totalMemoryValue2);
});
