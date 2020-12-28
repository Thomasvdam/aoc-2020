const { getInput } = require('../setup');

// L
// 0 same
// 1 y * -1, x
// 2 x, * -1, y * -1
// 3 y, x * -1

// R
// 0 same
// 1 y, x * -1
// 2 x, * -1, y, * -1
// 3 y * -1, x

function rotateWaypoint(waypoint, val, direction) {
    const turns = (val / 90) % 4;
    const { x, y } = waypoint;

    switch (turns) {
    case 0:
        return waypoint;
    case 1:
        waypoint.x = y * (direction === 'R' ? 1 : -1);
        waypoint.y = x * (direction === 'R' ? -1 : 1);
        return waypoint;
    case 2:
        waypoint.x = x * -1;
        waypoint.y = y * -1;
        return waypoint;
    case 3:
        waypoint.x = y * (direction === 'R' ? -1 : 1);
        waypoint.y = x * (direction === 'R' ? 1 : -1);
        return waypoint;
    default:
        throw new Error('UNEXPECTED_MATH');
    }
}

const ROTATIONS = ['N', 'E', 'S', 'W'];
const ROTATIONS_REV = ['N', 'W', 'S', 'E'];

function executeWaypointInstruction(state, instruction) {
    const { instr, val } = instruction;

    switch (instr) {
    case 'N':
        state.waypoint.y = state.waypoint.y + val;
        break;
    case 'S':
        state.waypoint.y = state.waypoint.y - val;
        break;
    case 'E':
        state.waypoint.x = state.waypoint.x + val;
        break;
    case 'W':
        state.waypoint.x = state.waypoint.x - val;
        break;
    case 'L':
        rotateWaypoint(state.waypoint, val, 'L');
        break;
    case 'R':
        rotateWaypoint(state.waypoint, val, 'R');
        break;
    case 'F':
        state.x += val * state.waypoint.x;
        state.y += val * state.waypoint.y;
        break;
    default:
        throw new Error('INVALID_INSTR');
    }
}

function getNewDir(originalDir, val, rotation) {
    const turns = val / 90 % rotation.length;
    const newIndex = (rotation.indexOf(originalDir) + turns) % rotation.length;
    return rotation[newIndex];
}

function executeInstruction(state, instruction) {
    const { instr, val } = instruction;

    switch (instr) {
    case 'N':
        state.y = state.y + val;
        break;
    case 'S':
        state.y = state.y - val;
        break;
    case 'E':
        state.x = state.x + val;
        break;
    case 'W':
        state.x = state.x - val;
        break;
    case 'L':
        state.dir = getNewDir(state.dir, val, ROTATIONS_REV);
        break;
    case 'R':
        state.dir = getNewDir(state.dir, val, ROTATIONS);
        break;
    case 'F':
        executeInstruction(state, { instr: state.dir, val });
        break;
    default:
        throw new Error('INVALID_INSTR');
    }
}

const lineRegex = /(\w)(\d+)/;
function processLine(line) {
    const [, instr, rawVal] = lineRegex.exec(line);
    return { instr, val: parseInt(rawVal, 10) };
}

getInput(data => {
    const instructions = data.split('\n').map(processLine);
    const state = {
        dir: 'E',
        x: 0,
        y: 0,
    };

    instructions.forEach((instruction) => {
        executeInstruction(state, instruction);
    });
    console.log('[DEBUG]: Manhattan distance ::: ', Math.abs(state.x) + Math.abs(state.y));

    const stateWaypoint = {
        waypoint: {
            x: 10,
            y: 1,
        },
        x: 0,
        y: 0,
    }
    instructions.forEach((instruction) => {
        executeWaypointInstruction(stateWaypoint, instruction);
    });
    console.log('[DEBUG]: Manhattan distance waypoint ::: ', Math.abs(stateWaypoint.x) + Math.abs(stateWaypoint.y));
});
