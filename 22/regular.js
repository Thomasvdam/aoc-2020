function cloneDeck(deck) {
    return [...deck];
}

function getWinner(player1, player2) {
    return player1.deck.length === 0 ? player2 : player1;
}

function printWinner(winner) {
    const score = winner.deck.reduceRight((acc, card, index, arr) => {
        const value = arr.length - index;
        return acc + card * value;
    }, 0);

    console.log('[DEBUG]: Winner, score ::: ', winner.name, score);
}

function isGameOver(player1, player2) {
    return player1.deck.length === 0 || player2.deck.length === 0;
}

function playRound(player1, player2) {
    const cardPlayer1 = player1.deck.shift();
    const cardPlayer2 = player2.deck.shift();

    if (cardPlayer1 > cardPlayer2) {
        player1.deck.push(cardPlayer1, cardPlayer2);
    } else {
        player2.deck.push(cardPlayer2, cardPlayer1);
    }
}

module.exports = {
    cloneDeck,
    getWinner,
    isGameOver,
    playRound,
    printWinner,
};
