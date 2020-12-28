const { cloneDeck, getWinner, isGameOver } = require('./regular');

function getRoundState(player1, player2) {
    return `${player1.deck.join(',')}-${player2.deck.join(',')}`;
}

function shouldPlayRecursionRound(card1, player1, card2, player2) {
    return card1 <= player1.deck.length && card2 <= player2.deck.length;
}

function startGame(player1, player2) {
    const rounds = new Set();

    while (!isGameOver(player1, player2)) {
        // Infinite round prevention rule
        const roundState = getRoundState(player1, player2);
        if (rounds.has(roundState)) return player1;

        // Draw cards.
        const cards = [player1.deck.shift(), player2.deck.shift()];

        let winner;
        if (shouldPlayRecursionRound(cards[0], player1, cards[1], player2)) {
            const subWinner = startGame(
                { name: player1.name, deck: cloneDeck(player1.deck).slice(0, cards[0]) },
                { name: player2.name, deck: cloneDeck(player2.deck).slice(0, cards[1]) });
            winner = subWinner.name === player1.name ? player1 : player2;
        } else {
            winner = cards[0] > cards[1] ? player1 : player2;
        }

        const orderedCards = winner === player1 ? cards : cards.reverse();

        winner.deck.push(...orderedCards);

        rounds.add(roundState);
    }

    return getWinner(player1, player2);
}

module.exports = {
    startGame,
};
