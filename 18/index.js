const { getInput } = require('../setup');

function processOperationsAddMulti(operations) {
    return operations.join(' ')
                     .split('*')
                     .map((addition) => eval(addition))
                     .reduce((acc, val) => acc * val, 1);
}

function processOperationsLtr(operations) {
    const [first, ...rest] = operations;
    const initialValue = parseInt(first, 10);

    let operator;
    return rest.reduce((acc, chars) => {
        switch (chars) {
        case '+':
            operator = (a, b) => a + b;
            return acc;
        case '*':
            operator = (a, b) => a * b;
            return acc;
        default:
            const val = parseInt(chars, 10);
            return operator(acc, val);
        }
    }, initialValue);
}

function createProcessBrackets(processor) {
    return function processBrackets(parts) {
        const result = []
        for (let index = 0; index < parts.length; index++) {
            const part = parts[index];
            switch (part) {
            case '(':
                let openCount = 0;
                const closingBracket = parts.findIndex((char, innerIndex) => {
                    if (innerIndex <= index) return false;
                    if (char === '(') openCount += 1;
                    if (char === ')') {
                        if (openCount === 0) return true;
                        openCount -= 1;
                    }
                });
                result.push(`${processBrackets(parts.slice(index + 1, closingBracket))}`);
                index = closingBracket;
                break;
            case ')':
                break;
            default:
                result.push(part);
            }
        }
    
        return processor(result);
    }
}

function processLine(line) {
    return line.split(' ').map((parts) => parts.split('')).flat();
}

getInput(rawData => {
    const data = rawData.split('\n').map(processLine);

    const ltrProcessor = createProcessBrackets(processOperationsLtr);
    const ltrResults = data.map(ltrProcessor);
    const totalSumLtr = ltrResults.reduce((acc, val) => acc + val);
    console.log('[DEBUG]: totalSumLtr ::: ', totalSumLtr);

    const addMultiProcessor = createProcessBrackets(processOperationsAddMulti);
    const addMultiResults = data.map(addMultiProcessor);
    const totalSumAddMulti = addMultiResults.reduce((acc, val) => acc + val);
    console.log('[DEBUG]: totalSumAddMulti ::: ', totalSumAddMulti);
});
