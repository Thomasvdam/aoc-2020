const { getInput } = require('../setup');

function getRuleOrder(rules, tickets) {
    const rulesPerColumn = [];
    for (let columnIndex = 0; columnIndex < rules.length; columnIndex += 1) {
        const matchingRules = rules.filter((rule) => {
            for (let ticketIndex = 0; ticketIndex < tickets.length; ticketIndex += 1) {
                const val = tickets[ticketIndex][columnIndex];
                if (!rule.isValid(val)) return false;
            }

            return true;
        });

        rulesPerColumn.push(matchingRules);
    }

    let hasMultipleRules = true;
    while (hasMultipleRules) {
        hasMultipleRules = false;
        rulesPerColumn.forEach((column) => {
            if (column.length === 1) {
                const rule = column[0];
                rulesPerColumn.forEach((innerColumn) => {
                    if (column === innerColumn) return;
    
                    const ruleIndex = innerColumn.findIndex(innerRule => innerRule === rule);
                    if (~ruleIndex) {
                        innerColumn.splice(ruleIndex, 1);
                    }
                });
            } else {
                hasMultipleRules = true;
            }
        });
    }

    return rulesPerColumn;
}

function createValidator(rules) {
    return function isValidTicket(ticket) {
        return ticket.every((val) => {
            return rules.some((rule) => {
                return rule.isValid(val);
            });
        });
    }
}

function sumInvalidValues(rules, tickets) {
    const invalidValues = tickets.map(ticket => {
        return ticket.filter((val) => {
            return rules.every((rule) => {
                return !rule.isValid(val);
            });
        });
    });

    return invalidValues.reduce((acc, ticket) => {
        return ticket.reduce((innerAcc, val) => innerAcc + val, acc);
    }, 0);
}

function processTicket(line) {
    return line.split(',').map(val => parseInt(val, 10));
}

const rangesRegex = /(\d+)-(\d+) or (\d+)-(\d+)/;
function processRule(line) {
    const [name, rawRanges] = line.split(':');
    const [, start1Raw, end1Raw, start2Raw, end2Raw] = rangesRegex.exec(rawRanges);

    const start1 = parseInt(start1Raw, 10);
    const end1 = parseInt(end1Raw, 10);
    const start2 = parseInt(start2Raw, 10);
    const end2 = parseInt(end2Raw, 10);
    return {
        name,
        isValid: (num) => {
            return (num >= start1 && num <= end1) || (num >= start2 && num <= end2);
        },
    };
}

getInput(rawData => {
    const [rawRules, rawMyTicket, rawNearbyTickets] = rawData.split(/^\n/m);
    const rules = rawRules.split('\n').filter(Boolean).map(processRule);
    const myTicket = processTicket(rawMyTicket.split('\n')[1]);
    const nearbyTickets = rawNearbyTickets.split('\n').slice(1).map(processTicket);

    const invalidValues = sumInvalidValues(rules, nearbyTickets);
    console.log('[DEBUG]: invalidValues ::: ', invalidValues);

    const isValidTicket = createValidator(rules);
    const validNearbyTickets = nearbyTickets.filter(isValidTicket);
    const orderedRules = getRuleOrder(rules, validNearbyTickets);

    const columnIndexes = orderedRules.reduce((acc, rule, index) => {
        if (rule[0].name.includes('departure')) {
            acc.push(index);
        }
        return acc;
    }, []);

    const departureColumns = columnIndexes.reduce((acc, column) => {
        return acc * myTicket[column];
    }, 1);

    console.log('[DEBUG]: departureColumns ::: ', departureColumns);
});
