const fs = require('fs');

const REQUIRED_FIELDS = [
    'byr',
    'iyr',
    'eyr',
    'hgt',
    'hcl',
    'ecl',
    'pid',
];

/**
    byr (Birth Year) - four digits; at least 1920 and at most 2002.
    iyr (Issue Year) - four digits; at least 2010 and at most 2020.
    eyr (Expiration Year) - four digits; at least 2020 and at most 2030.
    hgt (Height) - a number followed by either cm or in:
    If cm, the number must be at least 150 and at most 193.
    If in, the number must be at least 59 and at most 76.
    hcl (Hair Color) - a # followed by exactly six characters 0-9 or a-f.
    ecl (Eye Color) - exactly one of: amb blu brn gry grn hzl oth.
    pid (Passport ID) - a nine-digit number, including leading zeroes.
 */


const VALIDATORS = {
    byr: (val) => {
        const year = parseInt(val, 10);
        return (year >= 1920) && (year <= 2002);
    },
    iyr: (val) => {
        const year = parseInt(val, 10);
        return (year >= 2010) && (year <= 2020);
    },
    eyr: (val) => {
        const year = parseInt(val, 10);
        return (year >= 2020) && (year <= 2030);
    },
    hgt: (val) => {
        const [, num, metric] = /(\d+)(cm|in)/.exec(val) ?? [];
        if (metric === 'cm') {
            const len = parseInt(num, 10);
            return (len >= 150) && (len <= 193);
        } else if (metric === 'in') {
            const len = parseInt(num, 10);
            return (len >= 59) && (len <= 76);
        }
        return false;
    },
    hcl: (val) => {
        const leading = val[0];
        if (leading !== '#') return false;
        const rest = val.slice(1);
        return rest.length === 6 && rest.match(/[0-9a-f]{6}/);
    },
    ecl: (val) => {
        return ['amb', 'blu', 'brn', 'gry', 'grn', 'hzl', 'oth'].some(col => col === val);
    },
    pid: (val) => {
        return val.length === 9 && val.match(/\d{9}/);
    },
};

function isValidCredentials(creds) {
    return !Object.keys(VALIDATORS).some(key => {
        return !VALIDATORS[key](creds[key]);
    });
}

function isCompleteCredentials(creds) {
    return !REQUIRED_FIELDS.some(key => !creds[key]);
}

function processCreds(rawData) {
    const rawCreds = rawData.split(/[\n\s]/).filter(Boolean);
    return rawCreds.reduce((acc, rawCred) => {
        const [key, value] = rawCred.split(':');
        acc[key] = value;
        return acc;
    }, {});
}

fs.readFile('./input.txt', 'utf-8', (err, data) => {
    if (err) throw err;

    const creds = data.split(/^\n/m).map(processCreds);
    const completeCreds = creds.filter(isCompleteCredentials);
    console.log('[DEBUG]: completeCreds.length ::: ', completeCreds.length);

    const validCreds = completeCreds.filter(isValidCredentials);
    console.log('[DEBUG]: validCreds.length ::: ', validCreds.length);
});
