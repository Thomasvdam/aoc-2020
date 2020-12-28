const { getInput } = require('../setup');

function createRegexTemplate(rulebook, ruleNo) {
    const rule = rulebook[ruleNo];
    if (rule === 'a' || rule === 'b') return rule;

    const options = rule.body.map((option) => {
        return option.map((nextRuleNo) => {
            return createRegexTemplate(rulebook, nextRuleNo);
        }).join('');
    });

    if (!rule.split) return options[0];

    return `(${options.join('|')})`;
}

function createValidator(rulebook, ruleNo) {
    const template = createRegexTemplate(rulebook, ruleNo);
    return new RegExp(`^${template}$`);
}

function processRules(rawRules) {
    const formattedRules = rawRules.map((rawRule) => {
        let [rule, rawBody] = rawRule.split(':');
        rawBody = rawBody.trim();

        if (rawBody === '"a"') {
            return {
                rule,
                end: 'a',
            };
        }

        if (rawBody === '"b"') {
            return {
                rule,
                end: 'b',
            };
        }

        if (rawBody.includes('|')) {
            return {
                rule,
                split: true,
                body: rawBody.split(' | ').map((options) => options.split(' ')),
            };
        }

        return {
            rule,
            body: [rawBody.split(' ')],
        }
    });

    const rulebook = formattedRules.reduce((acc, formattedRule) => {
        const { rule, ...rest } = formattedRule;
        if (rest.end) {
            acc[rule] = rest.end;
        } else {
            acc[rule] = rest;
        }

        return acc;
    }, {});

    return rulebook;
}

getInput(rawData => {
    const [rawRules, rawMessages] = rawData.split(/^\n/m);
    const rulebook = processRules(rawRules.split('\n').filter(Boolean));
    const validator = createValidator(rulebook, '0');

    const messages = rawMessages.split('\n');

    const validMessages = messages.filter((message) => validator.test(message));
    console.log('[DEBUG]: validMessages ::: ', validMessages.length);

    // Trial and error hacky tacky
    rulebook['8'] = { split: true, body: [['42'], ['42', '42'], ['42', '42', '42'], ['42', '42', '42', '42'], ['42', '42', '42', '42', '42']] };
    rulebook['11'] = { split: true, body: [['42', '31'], ['42', '42', '31', '31'], ['42', '42', '42', '31', '31', '31'], ['42', '42', '42', '42', '31', '31', '31', '31'], ['42', '42', '42', '42', '42', '31', '31', '31', '31', '31']] };
    const validator2 = createValidator(rulebook, '0');

    const validMessages2 = messages.filter((message) => validator2.test(message));
    console.log('[DEBUG]: validMessages2 ::: ', validMessages2.length);
});
