const fs = require('fs');

function traverseMap(map, xDelta, yDelta) {
    let treesEncountered = 0;
    let xPos = 0;
    for (let yPos = yDelta; yPos < map.length; yPos += yDelta) {
        xPos += xDelta;
        xPos = xPos % map[yPos].length;
        const tree = map[yPos][xPos];
        if (tree) treesEncountered++;
    }

    return treesEncountered;
}

function processLine(line) {
    return line.split('').map(char => char === '#');
}

fs.readFile('./input.txt', 'utf-8', (err, data) => {
    if (err) throw err;

    const map = data.split('\n').map(processLine);
    const treesEncountered31 = traverseMap(map, 3, 1);
    console.log('[DEBUG]: treesEncountered31 ::: ', treesEncountered31);

    const treesEncountered11 = traverseMap(map, 1, 1);
    const treesEncountered51 = traverseMap(map, 5, 1);
    const treesEncountered71 = traverseMap(map, 7, 1);
    const treesEncountered12 = traverseMap(map, 1, 2,);

    const totalMultiplied = treesEncountered31 * treesEncountered11 * treesEncountered51 * treesEncountered71 * treesEncountered12;
    console.log('[DEBUG]: totalMultiplied ::: ', totalMultiplied);
});
