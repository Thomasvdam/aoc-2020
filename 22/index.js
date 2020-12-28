const { getInput } = require('../setup');
const { cloneDeck, getWinner, isGameOver, playRound, printWinner } = require('./regular');
const { startGame } = require('./recursive');

function processPlayer(rawPlayer) {
    const playerLines = rawPlayer.split('\n');
    const name = playerLines[0];
    const deck = playerLines.slice(1).map((card) => parseInt(card, 10));

    return { deck, name };
}

getInput(rawData => {
    const [player1, player2] = rawData.split('\n\n').map(processPlayer);
    // We need these for part 2.
    const originalDeck1 = cloneDeck(player1.deck);
    const originalDeck2 = cloneDeck(player2.deck);

    while (!isGameOver(player1, player2)) {
        playRound(player1, player2);
    }
    
    console.log('[DEBUG]: Part 1');
    const regularWinner = getWinner(player1, player2);
    printWinner(regularWinner);
 
    // Reset for part 2;
    player1.deck = originalDeck1;
    player2.deck = originalDeck2;

    console.log('[DEBUG]: Part 2');
    const recursiveWinner = startGame(player1, player2);
    printWinner(recursiveWinner);
});
