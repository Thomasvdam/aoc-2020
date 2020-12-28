const { getInput } = require('../setup');

function edgesMatch(edge, oppositeEdge) {
    return edge === oppositeEdge.split('').reverse().join('');
}

function placeTiles(grid, index, tiles) {
    const x = index % grid._size;
    const y = Math.floor(index / grid.size);

    const clonedTiles = tiles.map((tile) => ({ id: tile.id, edges: tile.edges.slice(0) }));

    for (let index = 0; index < clonedTiles.length; index++) {
        const tile = clonedTiles[index];
        const remainingTiles = clonedTiles.filter((otherTile) => otherTile !== tile);

        for (let orientation = 0; orientation < 4; orientation++) {
            
            // Check neighbours
            let fits = true;
            for (let xDelta = -1; xDelta < 1; xDelta += 1) {
                for (let yDelta = -1; yDelta < 1; yDelta += 1) {
                    if (yDelta !== 0 && xDelta !== 0) continue;
                    const neighbourCoords = `${x + xDelta}-${y + yDelta}`;
                    if (!grid.has(neighbourCoords)) continue;
    
                    const neighbour = grid.get(neighbourCoords);
                    if (xDelta === 0 && yDelta === 1) {
                        fits = fits && edgesMatch(tile.edges[0], neighbour.edges[2]);
                    }
                    if (xDelta === 0 && yDelta === -1) {
                        fits = fits && edgesMatch(tile.edges[2], neighbour.edges[0]);
                    }
                    if (xDelta === 1 && yDelta === 0) {
                        fits = fits && edgesMatch(tile.edges[1], neighbour.edges[3]);
                    }
                    if (xDelta === -1 && yDelta === 0) {
                        fits = fits && edgesMatch(tile.edges[3], neighbour.edges[1]);
                    }

                    if (!fits) break;
                }
                if (!fits) break;
            }

            if (fits) {
                const coords = `${x}-${y}`;
                grid.set(coords, tile);
                const result = placeTiles(grid, index + 1, remainingTiles);
                if (result) return true;

                grid.delete(coords);
            }

            const shift = tile.edges.pop();
            tile.edges.unshift(shift);
        }

        const shift = tile.edges.pop();
        tile.edges.unshift(shift);
    }

    return false;
}

function processTile(rawTile) {
    const [rawId, ...rawBody] = rawTile.split('\n').filter(Boolean);
    const [, id] = /(\d+)/.exec(rawId);

    const top = [];
    const right = [];
    const bottom = [];
    const left = [];

    rawBody.forEach((line, y) => {
        // const binaryLine = line.replace(/(\.|#)/g, (val) => {
        //     return val === '.' ? 0 : 1;
        // });
        line.split('').forEach((char, x) => {
            if (y === 0) {
                top.push(char);
            }

            if (y === rawBody.length - 1) {
                bottom.unshift(char);
            }

            if (x === 0) {
                left.unshift(char);
            }

            if (x === line.length - 1) {
                right.push(char);
            }
        });
    });

    const topBin = top.join('');
    const rightBin = right.join('');
    const bottomBin = bottom.join('');
    const leftBin = left.join('');

    return {
        id: parseInt(id, 10),
        edges: [topBin, rightBin, bottomBin, leftBin],
    };
}

getInput(rawData => {
    const tiles = rawData.split(/^\n/m).map(processTile);
    const grid = new Map();
    grid._size = Math.sqrt(tiles.length);

    placeTiles(grid, 0, tiles);
});
