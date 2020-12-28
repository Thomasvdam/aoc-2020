const fs = require('fs');

function isValid1({ a: min, b: max}, char, pwd) {
    const result = pwd.match(new RegExp(char, 'g'))?.length;
    return (result >= min) && (result <= max);
}

function isValid2({ a, b }, char, pwd) {
    const isA = pwd[a - 1] === char;
    const isB = pwd[b - 1] === char;
    return isA ^ isB;
}

function processLine(line) {
    const [rule, charRaw, pwd] = line.split(' ');
    const [aRaw, bRaw] = rule.split('-');
    const a = parseInt(aRaw, 10);
    const b = parseInt(bRaw, 10);
    const char = charRaw[0];
    return [{ a, b }, char, pwd]
}

fs.readFile('./input.txt', 'utf-8', (err, data) => {
    if (err) throw err;

    const lines = data.split('\n').map(processLine);
    const valid1Count = lines.map(args => isValid1(...args)).filter(valid => valid).length;
    console.log('[DEBUG]: valid1Count ::: ', valid1Count);

    const valid2Count = lines.map(args => isValid2(...args)).filter(valid => valid).length;
    console.log('[DEBUG]: valid2Count ::: ', valid2Count);
});
