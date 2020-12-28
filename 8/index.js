const { getInput } = require('../setup');

const parseLine = /(\w+) ([+-]\d+)/;

function flipOp(op) {
    return op === 'jmp' ? 'nop' : 'jmp';
}

function shouldFlipOp(op) {
    return op !== 'acc';
}

function runProgramSingleExecution(scope, instructions) {
    while (true) {
        const { _pointer, _accumulator } = scope;
        const instruction = instructions[_pointer];

        if (_pointer === instructions.length) {
            return _accumulator;
        }

        if (!instruction) {
            throw new Error('OUT_OF_BOUNDS');
        }

        if (instruction._visited) {
            const err = new Error('INF_LOOP');
            err._lastAccumulator = _accumulator;
            throw err;
        }

        executeInstruction(scope, instruction);
        instruction._visited = true;
    }
}

function executeInstruction(scope, instruction) {
    const { op, val } = instruction;
    switch (op) {
    case 'nop':
        scope._pointer += 1;
        break;
    case 'acc': 
        scope._accumulator += val;
        scope._pointer += 1;
        break;
    case 'jmp':
        scope._pointer += val;
        break;
    default:
        throw new Error('INVALID_OP');
    }

    return scope;
}

function processLine(line) {
    const [, op, value] = parseLine.exec(line);
    return {
        op,
        val: parseInt(value, 10),
    };
}

getInput(data => {
    const instructions = data.split('\n').map(processLine);
    try {
        const accBeforeLoop = runProgramSingleExecution({ _pointer: 0, _accumulator: 0}, instructions);
        console.log('[DEBUG]: accBeforeLoop ::: ', accBeforeLoop);
    } catch(err) {
        if (err.message = 'INF_LOOP') {
            console.log('[DEBUG]: accBeforeLoop ::: ', err._lastAccumulator);
        }
    }

    for (const instruction of instructions) {
        const { op } = instruction;

        if (!shouldFlipOp(op)) continue;

        instruction.op = flipOp(op);

        try {
            const acc = runProgramSingleExecution({ _pointer: 0, _accumulator: 0}, instructions);
            console.log('[DEBUG]: acc after fix ::: ', acc);
            break;
        } catch(err) {
            // restore original
            instructions.forEach(instr => delete instr._visited);
            instruction.op = op;
        }
    }
});
