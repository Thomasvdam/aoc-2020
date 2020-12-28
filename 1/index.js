const fs = require('fs');

const TARGET_1 = 2020;

function find2SumsToTarget(numbers) {
    for (const [index, number1] of numbers.entries()) {
        for (const number2 of numbers.slice(index + 1)) {
            if (number1 + number2 === TARGET_1) {
                return {
                    number1,
                    number2,
                };
            }
        }
    }

    return null;
}

function find3SumsToTarget(numbers) {
    for (const [index, number1] of numbers.entries()) {
        for (const number2 of numbers.slice(index + 1)) {
            for (const number3 of numbers.slice(index + 2)) {
                if (number1 + number2 + number3 === TARGET_1) {
                    return {
                        number1,
                        number2,
                        number3
                    };
                }
            }
        }
    }

    return null;
}

fs.readFile('./input1.txt', 'utf-8', (err, data) => {
    if (err) throw err;
    const numbers = data.split('\n').map((line) => parseInt(line, 10));

    const { number1: part1number1, number2: part1number2 } = find2SumsToTarget(numbers);
    console.log('[1]: answer ::: ', part1number1 * part1number2);

    const { number1, number2, number3 } = find3SumsToTarget(numbers);
    console.log('[2]: answer ::: ', number1 * number2 * number3);
});
