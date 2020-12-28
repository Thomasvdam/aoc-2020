const { getInput } = require('../setup');

function getEncryptionKey(transformer, loopSize) {
    let value = 1;
    for (let i = 0; i < loopSize; i += 1) {
        value = transformer(value);
    }

    return value;
}

function getLoopSize(transformer, target) {
    let value = 1;
    let loopSize = 0;
    while (value !== target) {
        value = transformer(value);
        loopSize += 1;
    }

    return loopSize;
}

function createTransform(subject) {
    return function transformValue(value) {
        return (value * subject) % 20201227;
    }
}

function processLine(line) {
    return parseInt(line, 10);
}

getInput(rawData => {
    const [cardPub, doorPub] = rawData.split('\n').map(processLine);

    const pubTransformer = createTransform(7);
    const cardLoopSize = getLoopSize(pubTransformer, cardPub);
    const doorLoopSize = getLoopSize(pubTransformer, doorPub);

    const encCardTransformer = createTransform(cardPub);
    const encryptionKeyCard = getEncryptionKey(encCardTransformer, doorLoopSize);
    console.log('[DEBUG]: encryptionKey ::: ', encryptionKeyCard);

    const encDoorTransformer = createTransform(doorPub);
    const encryptionKeyDoor = getEncryptionKey(encDoorTransformer, cardLoopSize);
    console.log('[DEBUG]: encryptionKey ::: ', encryptionKeyDoor);
});
