const { getInput } = require('../setup');

const TARGET_BAG = 'shiny gold';

const extractBagTypeAndRule = /(\w+ \w+) bags contain (.*)/;
const extractBagTypesAndAmount = /(\d+) (\w+ \w+)/;

function processRule(rawLine) {
    const [, type, rawRule] = extractBagTypeAndRule.exec(rawLine);

    const bagRule = {
        type,
    };

    if (rawRule === 'no other bags.') {
        return bagRule;
    }

    const contains = rawRule.split(', ').map(ruleEntry => {
        const [, amount, type] = extractBagTypesAndAmount.exec(ruleEntry);
        return {
            amount: parseInt(amount, 10),
            type,
        };
    });

    bagRule.contains = contains;

    return bagRule;
}

function constructMap(bagRules) {
    const bagMap = bagRules.reduce((acc, bagRule) => {
        const { contains, type } = bagRule;
        const containsTypes = contains?.reduce((containsAcc, { amount, type: containType}) => {
            containsAcc[containType] = amount;
            return containsAcc;
        }, {});
        acc[type] = containsTypes;
        return acc;
    }, {});

    return bagMap;
}

function containsTarget(bagMap, type) {
    if (!bagMap[type]) return false;
    let containsGold = false;
    const containKeys = Object.keys(bagMap[type]);
    for (let index = 0; index < containKeys.length; index++) {
        const key = containKeys[index];
        if (key === TARGET_BAG) return true;
        containsGold = containsGold || containsTarget(bagMap, key);
    }

    return containsGold;
}

function countBagsWithTarget(bagMap) {
    let shinyCount = 0;
    const bagKeys = Object.keys(bagMap);
    for (let index = 0; index < bagKeys.length; index++) {
        const key = bagKeys[index];
        if (containsTarget(bagMap, key)) {
            shinyCount++;
        }
    }

    return shinyCount
}

function countBagsInTarget(bagMap, type) {
    let bagCount = 0;
    if (!bagMap[type]) {
        return bagCount;
    }
    
    const containKeys = Object.keys(bagMap[type]);
    for (let index = 0; index < containKeys.length; index++) {
        const key = containKeys[index];
        const amount = bagMap[type][key];
        bagCount += amount + amount * countBagsInTarget(bagMap, key);
    }

    return bagCount;
}

getInput(data => {
    const bagRules = data.split('\n').map(processRule);
    const bagMap = constructMap(bagRules);

    const bagsThatContainTarget = countBagsWithTarget(bagMap);
    console.log('[DEBUG]: bagsThatContainTarget ::: ', bagsThatContainTarget);

    const bagsContainedInTarget = countBagsInTarget(bagMap, TARGET_BAG);
    console.log('[DEBUG]: bagsContainedInTarget ::: ', bagsContainedInTarget);
    // console.log('[DEBUG]: bagMap ::: ', bagMap);
});
