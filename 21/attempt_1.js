const { getInput } = require('../setup');

const temp = [];
function countNonAllergenIngredients(foods) {
    return foods.reduce((acc, item) => {
        item.ingredients.forEach((ingr) => {
            if (!temp.includes(ingr)) temp.push(ingr);
        })
        return acc + item.ingredients.length;
    }, 0);
}

function countUnmarked(truthTable, allAllergens, allIngredients) {
    return allIngredients.reduce((acc, ingredient) => {
        if (truthTable[ingredient]._allergen) return acc;

        return allAllergens.reduce((innerAcc, allergen) => {
            if (!truthTable[ingredient][allergen].marked) return innerAcc + 1;
            return innerAcc;
        }, acc);
    }, 0);
}

function filterKnownItems(item, truthTable) {
    item.ingredients = item.ingredients.filter((ingredient) => {
        return !truthTable[ingredient]._allergen;
    });

    item.allergens = item.allergens.filter((allergen) => {
        return !truthTable._foundAllergens.includes(allergen);
    });
}

function markIngredientAsAllergen(truthTable, ingredient, allergen) {
    console.log('[DEBUG]: marking', ingredient, allergen);
    truthTable[ingredient]._allergen = allergen;
    truthTable._foundAllergens.push(allergen);
}

function updateTruthTable(truthTable, allAllergens, allIngredients) {
    allAllergens.forEach((allergen) => {
        let unmarkedIngredient;
        for (let index = 0; index < allIngredients.length; index++) {
            const ingredient = allIngredients[index];
            if (truthTable[ingredient]._allergen) continue;

            const { marked } = truthTable[ingredient][allergen];
            if (marked) continue;
            // We're only interested in the case where 1 item is unmarked
            if (unmarkedIngredient) return;
            unmarkedIngredient = ingredient;
        }

        if (!unmarkedIngredient) return;

        markIngredientAsAllergen(truthTable, unmarkedIngredient, allergen);
    });

    truthTable._foundAllergens.forEach((foundAllergen) => {
        allIngredients.forEach((ingredient) => {
            if (truthTable[ingredient]._allergen) return;
            truthTable[ingredient][foundAllergen].marked = true;
            truthTable[ingredient][foundAllergen].isAllergen = false;
        });
    });

    allIngredients.forEach((ingredient) => {
        const { allMarked, allSafe } = allAllergens.reduce((acc, allergen) => {
            const { marked, isAllergen } = truthTable[ingredient][allergen];
            acc.allMarked = acc.allMarked && marked;
            acc.allSafe = acc.allSafe && !isAllergen;
            return acc;
        }, { allMarked: true, allSafe: true });

        if (allMarked && allSafe) {
            truthTable[ingredient]._allergen = 'none';
        }
    });
}

function getFoodsWithAllergen(foods, allergen) {
    return foods.filter((item) => item.allergens.includes(allergen));
}

function createTruthTable(allAllergens, allIngredients) {
    return allIngredients.reduce((acc, ingredient) => {
        const table = allAllergens.reduce((innerAcc, allergen) => {
            innerAcc[allergen] = {
                marked: false,
                isAllergen: null,
            };
            return innerAcc;
        }, {});
        acc[ingredient] = table;

        return acc;
    }, { _foundAllergens: [] });
}

function createPushUnique(target) {
    return function pushUnique(item) {
        if (target.includes(item)) return;
        target.push(item);
    }
}

function processLine(line) {
    const [, ingredientsRaw, allergensRaw] = /(.*) \(contains (.*)\)/.exec(line);
    const ingredients = ingredientsRaw.split(' ');
    const allergens = allergensRaw.split(' ').map((allergen) => allergen.replace(',', ''));

    return { allergens, ingredients };
}

getInput(rawData => {
    const foods = rawData.split('\n').map(processLine);

    const { allAllergens, allIngredients } = foods.reduce((acc, item) => {
        const { allergens, ingredients } = item;
        const pushNewAllergens = createPushUnique(acc.allAllergens);
        allergens.forEach(pushNewAllergens);

        const pushNewIngredients = createPushUnique(acc.allIngredients);
        ingredients.forEach(pushNewIngredients);

        return acc;
    }, { allAllergens: [], allIngredients: [] });

    const truthTable = createTruthTable(allAllergens, allIngredients);

    let i = 0;
    while (countUnmarked(truthTable, allAllergens, allIngredients) > 0 && i < 10) {
        allAllergens.forEach((allergen) => {
            const allergenFoods = getFoodsWithAllergen(foods, allergen);
            if (allergenFoods.length < 1) return;
            const allergenCounts = allergenFoods.map((item) => item.allergens)
                                                  .reduce((acc, allergens) => acc.concat(allergens))
                                                  .reduce((acc, item) => {
                                                      if (!acc[item]) acc[item] = 0;
                                                      acc[item] += 1;
                                                      acc.total +=1;
                                                      return acc;
                                                  }, { total: 0 });

            const ingredientCounts = allergenFoods.map((item) => item.ingredients)
                                                  .reduce((acc, ingredients) => acc.concat(ingredients))
                                                  .reduce((acc, item) => {
                                                      if (!acc[item]) acc[item] = 0;
                                                      acc[item] += 1;
                                                      acc.total += 1;
                                                      return acc;
                                                  }, { total: 0 });
    
            Object.keys(ingredientCounts).forEach((ingredient) => {
                if (ingredient === 'total') return;

                if (allergenCounts[allergen] === allergenCounts.total) {
                    if (allergenCounts.total === 1 && ingredientCounts.total === 1) {
                        markIngredientAsAllergen(truthTable, ingredient, allergen);
                    } else if (ingredientCounts[ingredient] !== allergenCounts.total) {
                        truthTable[ingredient][allergen].marked = true;
                        truthTable[ingredient][allergen].isAllergen = false;
                    } else if (Object.keys(allergenCounts).length - 1 === 1 && allergenFoods.length !== 1) {
                        markIngredientAsAllergen(truthTable, ingredient, allergen);
                    }
                } else {
                    if (ingredientCounts[ingredient] < allergenFoods.length) {
                        truthTable[ingredient][allergen].marked = true;
                        truthTable[ingredient][allergen].isAllergen = false;
                    }
                }
            });
        });
    
        updateTruthTable(truthTable, allAllergens, allIngredients);
        foods.forEach((item) => filterKnownItems(item, truthTable));
        i++;
    }

    const leftKeys = Object.keys(truthTable).filter((key) => {
        return !truthTable[key]._allergen;
    });
    leftKeys.forEach((key) => {
        console.log(key, truthTable[key]);
    });

    const safeFoodCount = countNonAllergenIngredients(foods);
    console.log('[DEBUG]: safeFoodCount ::: ', safeFoodCount);
    console.log('[DEBUG]: temp ::: ', temp);
    console.log('[DEBUG]: foods ::: ', foods);
});
