const DButils = require("./DButils");

async function getFavoriteRecipes(username){
    const recipes_id = await DButils.execQuery(`SELECT recipe_id FROM UserFavoriteRecipes WHERE username='${username}'`);
    return recipes_id;
}

async function addToFavorites(username, recipe_id){
    await DButils.execQuery(`INSERT INTO UserFavoriteRecipes VALUES ('${username}',${recipe_id})`);
}

async function getMyRecipes(username) {
    const query = `SELECT R.recipe_id, R.title, R.image, R.ready_in_minutes, R.vegetarian, R.vegan, R.gluten_free
                   FROM UserRecipes U
                   JOIN Recipes R ON U.recipe_id = R.recipe_id
                   WHERE U.username = '${username}'`;
    const recipes = await DButils.execQuery(query);
    return recipes;
}

async function addToMyRecipes(username, recipe_details){
    let query = `INSERT INTO Recipes (title, image, ready_in_minutes, vegetarian, vegan, gluten_free, instructions, portions) 
                 VALUES ('${recipe_details.title}', '${recipe_details.image}', ${recipe_details.ready_in_minutes}, 
                          ${recipe_details.vegetarian}, ${recipe_details.vegan}, ${recipe_details.gluten_free}, 
                         '${recipe_details.instructions}', ${recipe_details.portions})`;
    await DButils.execQuery(query);

    query = `SELECT LAST_INSERT_ID() as id`;
    let result = await DButils.execQuery(query);
    let recipeId = result[0].id;

    query = `INSERT INTO UserRecipes (username, recipe_id) VALUES ('${username}', ${recipeId})`;
    await DButils.execQuery(query);

    for(let ingredient of recipe_details.ingredients){
        query = `INSERT INTO RecipeIngredients (recipe_id, ingredient_name, quantity) 
                 VALUES (${recipeId}, '${ingredient.name}', '${ingredient.quantity}')`;
        await DButils.execQuery(query);
    }
}

async function getRecipeFromMyRecipes(username, recipe_id) {
    const query = `
        SELECT R.recipe_id, R.title, R.image, R.ready_in_minutes, R.vegetarian, R.vegan, R.gluten_free, 
               RI.ingredient_name, RI.quantity AS ingredient_quantity
        FROM UserRecipes U
        JOIN Recipes R ON U.recipe_id = R.recipe_id
        JOIN RecipeIngredients RI ON R.recipe_id = RI.recipe_id
        WHERE U.username = '${username}' AND U.recipe_id = ${recipe_id}`;
    const recipe = await DButils.execQuery(query);
    return recipe;
}

async function getFamilyRecipes(username) {
    const query = `SELECT R.recipe_id, R.title, R.image, R.ready_in_minutes, R.vegetarian, R.vegan, R.gluten_free
                   FROM UsersFamilyRecipes U
                   JOIN Recipes R ON U.recipe_id = R.recipe_id
                   WHERE U.username = '${username}'`;
    const recipes = await DButils.execQuery(query);
    return recipes;
}

async function addToFamilyRecipes(username, recipe_details){
    let query = `INSERT INTO Recipes (title, image, ready_in_minutes, vegetarian, vegan, gluten_free, instructions, portions) 
                 VALUES ('${recipe_details.title}', '${recipe_details.image}', ${recipe_details.ready_in_minutes}, 
                          ${recipe_details.vegetarian}, ${recipe_details.vegan}, ${recipe_details.gluten_free}, 
                         '${recipe_details.instructions}', ${recipe_details.portions})`;
    await DButils.execQuery(query);

    query = `SELECT LAST_INSERT_ID() as id`;
    let result = await DButils.execQuery(query);
    let recipeId = result[0].id;

    query = `INSERT INTO UsersFamilyRecipes (username, recipe_id, family_member, traditional_time) 
             VALUES ('${username}', ${recipeId}, '${recipe_details.family_member}', '${recipe_details.traditional_time}')`;
    await DButils.execQuery(query);

    for(let ingredient of recipe_details.ingredients){
        query = `INSERT INTO RecipeIngredients (recipe_id, ingredient_name, quantity) 
                 VALUES (${recipeId}, '${ingredient.name}', '${ingredient.quantity}')`;
        await DButils.execQuery(query);
    }

    for(let image of recipe_details.images){
        query = `INSERT INTO UsersFamilyRecipesImages (recipe_id, image_url) 
                    VALUES (${recipeId}, '${image.image_url}')`;
        await DButils.execQuery(query);
    }
}

async function getRecipeFromFamilyRecipes(username, recipe_id) {
    const query = `
        SELECT R.recipe_id, R.title, R.image, R.ready_in_minutes, R.vegetarian, R.vegan, R.gluten_free, 
               RI.ingredient_name, RI.quantity AS ingredient_quantity, U.family_member, U.traditional_time, UI.image_url
        FROM UsersFamilyRecipes U
        JOIN Recipes R ON U.recipe_id = R.recipe_id
        JOIN RecipeIngredients RI ON R.recipe_id = RI.recipe_id
        JOIN UsersFamilyRecipesImages UI ON R.recipe_id = UI.recipe_id
        WHERE U.username = '${username}' AND U.recipe_id = ${recipe_id}`;
    const recipe = await DButils.execQuery(query);
    return recipe;
}

async function getLastWatchedRecipes(username, amountToRetrieve){
    let query = `SELECT recipe_id FROM RecipeLastViews
                WHERE username = '${username}'
                ORDER BY last_view_time DESC`;
    if(amountToRetrieve)
        query += ` LIMIT ${amountToRetrieve}`;
    query += `;`;
    const recipes_id = await DButils.execQuery(query);
    return recipes_id;
}

exports.getFavoriteRecipes = getFavoriteRecipes;
exports.addToFavorites = addToFavorites;

exports.getMyRecipes = getMyRecipes;
exports.addToMyRecipes = addToMyRecipes;
exports.getRecipeFromMyRecipes = getRecipeFromMyRecipes;

exports.getFamilyRecipes = getFamilyRecipes;
exports.addToFamilyRecipes = addToFamilyRecipes;
exports.getRecipeFromFamilyRecipes = getRecipeFromFamilyRecipes;

exports.getLastWatchedRecipes = getLastWatchedRecipes;