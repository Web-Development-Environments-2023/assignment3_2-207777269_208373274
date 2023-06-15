const DButils = require("./DButils");

async function getUserFavoriteRecipes(username){
    const recipes_id = await DButils.execQuery(`SELECT recipe_id FROM UserFavoriteRecipes WHERE username='${username}'`);
    return recipes_id;
}

async function addToUserFavorites(username, recipe_id) {
    try {
      await DButils.execQuery(`INSERT INTO UserFavoriteRecipes VALUES ('${username}', ${recipe_id})`);
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY"){
            throw { status: 409, message: 'Recipe already exists in favorites' };
        }
      throw new Error('Failed to add the recipe to favorites');
    }
  }

async function getUserRecipes(username) {
    const query = `SELECT R.recipe_id, R.title, R.image, R.ready_in_minutes, R.vegetarian, R.vegan, R.gluten_free
                   FROM UserRecipes U
                   JOIN Recipes R ON U.recipe_id = R.recipe_id
                   WHERE U.username = '${username}'`;
    const recipes = await DButils.execQuery(query);
    return recipes;
}

async function addToUserRecipes(username, recipe_details){
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

async function getRecipeFromUserRecipes(username, recipe_id) {
    const recipeQuery = `
        SELECT R.recipe_id, R.title, R.image, R.ready_in_minutes, R.vegetarian, R.vegan, R.gluten_free, R.instructions, R.portions
        FROM UserRecipes U
        JOIN Recipes R ON U.recipe_id = R.recipe_id
        WHERE U.username = '${username}' AND U.recipe_id = ${recipe_id}`;
    const recipe = await DButils.execQuery(recipeQuery);
    if(recipe.length === 0)
        throw { status: 404, message: "User recipe not found" };

    const ingredientsQuery = `SELECT ingredient_name, quantity FROM recipeingredients WHERE recipe_id = ${recipe_id}`;
    const ingredientsArray = await DButils.execQuery(ingredientsQuery);

    return Object.assign(recipe[0], {ingredients:ingredientsArray});
}

async function getUserFamilyRecipes(username) {
    const query = `SELECT R.recipe_id, R.title, R.image, R.ready_in_minutes, R.vegetarian, R.vegan, R.gluten_free
                   FROM UserFamilyRecipes U
                   JOIN Recipes R ON U.recipe_id = R.recipe_id
                   WHERE U.username = '${username}'`;
    const recipes = await DButils.execQuery(query);
    return recipes;
}

async function addToUserFamilyRecipes(username, recipe_details){
    let query = `INSERT INTO Recipes (title, image, ready_in_minutes, vegetarian, vegan, gluten_free, instructions, portions) 
                 VALUES ('${recipe_details.title}', '${recipe_details.image}', ${recipe_details.ready_in_minutes}, 
                          ${recipe_details.vegetarian}, ${recipe_details.vegan}, ${recipe_details.gluten_free}, 
                         '${recipe_details.instructions}', ${recipe_details.portions})`;
    await DButils.execQuery(query);

    query = `SELECT LAST_INSERT_ID() as id`;
    let result = await DButils.execQuery(query);
    let recipeId = result[0].id;

    query = `INSERT INTO UserFamilyRecipes (username, recipe_id, family_member, traditional_time) 
             VALUES ('${username}', ${recipeId}, '${recipe_details.family_member}', '${recipe_details.traditional_time}')`;
    await DButils.execQuery(query);

    for(let ingredient of recipe_details.ingredients){
        query = `INSERT INTO RecipeIngredients (recipe_id, ingredient_name, quantity) 
                 VALUES (${recipeId}, '${ingredient.name}', '${ingredient.quantity}')`;
        await DButils.execQuery(query);
    }

    for(let image of recipe_details.images){
        query = `INSERT INTO userfamilyrecipeimages (recipe_id, image_url) 
                    VALUES (${recipeId}, '${image.image_url}')`;
        await DButils.execQuery(query);
    }
}

async function getRecipeFromUserFamilyRecipes(username, recipe_id) {
    const recipeQuery = `
        SELECT R.recipe_id, R.title, R.image, R.ready_in_minutes, R.vegetarian, R.vegan, R.gluten_free, R.instructions, R.portions, F.family_member, F.traditional_time
        FROM UserFamilyRecipes F
        JOIN Recipes R ON F.recipe_id = R.recipe_id
        WHERE F.username = '${username}' AND F.recipe_id = ${recipe_id}`;
    const recipe = await DButils.execQuery(recipeQuery);
    if(recipe.length === 0)
        throw { status: 404, message: "Family recipe not found" };

    const ingredientsQuery = `SELECT ingredient_name, quantity FROM recipeingredients WHERE recipe_id = ${recipe_id}`;
    const ingredientsArray = await DButils.execQuery(ingredientsQuery);

    const imagesQuery = `SELECT image_url FROM userfamilyrecipeimages WHERE recipe_id = ${recipe_id}`;
    const imagesArray = await DButils.execQuery(imagesQuery);

    return Object.assign(recipe[0], {ingredients:ingredientsArray}, {images:imagesArray});
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

exports.getUserFavoriteRecipes = getUserFavoriteRecipes;
exports.addToUserFavorites = addToUserFavorites;

exports.getUserRecipes = getUserRecipes;
exports.addToUserRecipes = addToUserRecipes;
exports.getRecipeFromUserRecipes = getRecipeFromUserRecipes;

exports.getUserFamilyRecipes = getUserFamilyRecipes;
exports.addToUserFamilyRecipes = addToUserFamilyRecipes;
exports.getRecipeFromUserFamilyRecipes = getRecipeFromUserFamilyRecipes;

exports.getLastWatchedRecipes = getLastWatchedRecipes;