const { getInput } = require('../setup');

function intersection(setA, setB) {
    return new Set([...setA].filter(val => setB.has(val)));
}

function processLine(line) {
    const [, ingredientsRaw, allergensRaw] = /(.*) \(contains (.*)\)/.exec(line);
    const ingredients = ingredientsRaw.split(' ');
    const allergens = allergensRaw.split(' ').map((allergen) => allergen.replace(',', ''));

    return { allergens, ingredients };
}

getInput(rawData => {
    const foods = rawData.split('\n').map(processLine);

    const ingredientsPerAllergen = foods.reduce((acc, item) => {
        const { allergens, ingredients } = item;
        const ingredientSet = new Set(ingredients)
        allergens.forEach((allergen) => {
            if (!acc[allergen]) {
                acc[allergen] = ingredientSet;
            } else {
                acc[allergen] = intersection(acc[allergen], ingredientSet)
            }
        });

        return acc;
    }, {});

    const allergensPerIngredient = Object.keys(ingredientsPerAllergen).reduce((acc, allergen) => {
        const ingredients = ingredientsPerAllergen[allergen];
        ingredients.forEach((ingredient) => {
            if (!acc[ingredient]) {
                acc[ingredient] = [allergen];
            } else {
                acc[ingredient].push(allergen);
            }
        });

        return acc;
    }, {});

    const safeIngredientCount = foods.reduce((acc, item) => {
        return item.ingredients.reduce((innerAcc, ingredient) => {
            if (allergensPerIngredient[ingredient]) return innerAcc;
            return innerAcc + 1;
        }, acc);
    }, 0);
    console.log('[DEBUG]: safeIngredientCount ::: ', safeIngredientCount);

    const ingredentToAllergenMap = [];
    const dangerousIngredients = Object.keys(allergensPerIngredient).map((ingredient) => {
        return {
            ingredient,
            allergens: new Set(allergensPerIngredient[ingredient]),
        };
    });

    const totalIngredients = dangerousIngredients.length;
    while (ingredentToAllergenMap.length !== totalIngredients) {
        dangerousIngredients.sort((a, b) => a.allergens.size - b.allergens.size);
        const { ingredient, allergens } = dangerousIngredients.shift();

        const allergen = [...allergens][0];
        ingredentToAllergenMap.push({ ingredient, allergen });
        dangerousIngredients.forEach((dangerousIngredient) => {
            const { allergens } = dangerousIngredient;
            allergens.delete(allergen);
        });
    }
    const sortedMap = ingredentToAllergenMap.sort((a, b) => a.allergen.localeCompare(b.allergen));
    const dangeroutIngredientsString = sortedMap.map((dangerousIngredient) => dangerousIngredient.ingredient).join(',');
    console.log('[DEBUG]: dangeroutIngredientsString ::: ', dangeroutIngredientsString);
});
