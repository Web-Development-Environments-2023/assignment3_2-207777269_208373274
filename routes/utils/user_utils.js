const DButils = require("./DButils");




async function markAsFavorite(username, recipe_id){
    await DButils.execQuery(`insert into FavoritesRecipes values ('${username}',${recipe_id})`);
}

async function getFavoriteRecipes(username){
    const recipes_id = await DButils.execQuery(`select recipeId from FavoritesRecipes where username='${username}'`);
    return recipes_id;
}




async function addToMyRecipes(username, recipe_details){
    // Add new recipe to Recipes table
    let query = `INSERT INTO Recipes (title, image, ready_in_minutes, aggregate_likes, vegetarian, vegan, gluten_free, instructions, portions) 
                 VALUES ('${recipe_details.title}', '${recipe_details.image}', ${recipe_details.readyInMinutes}, ${recipe_details.popularity}, 
                         ${recipe_details.vegetarian}, ${recipe_details.vegan}, ${recipe_details.glutenFree}, 
                         '${recipe_details.instructions}', ${recipe_details.portions})`;
    await DButils.execQuery(query);

    // Get the id of the recently added recipe
    query = `SELECT LAST_INSERT_ID() as id`;
    let result = await DButils.execQuery(query);
    let recipeId = result[0].id;

    // Add the new recipe to MyRecipes for the current user
    query = `INSERT INTO MyRecipes (username, recipe_id) VALUES ('${username}', ${recipeId})`;
    await DButils.execQuery(query);

    // Add ingredients for the recipe to RecipeIngredients
    for(let ingredient of recipe_details.ingredients){
        query = `INSERT INTO RecipeIngredients (recipe_id, ingredient_name, quantity) 
                 VALUES (${recipeId}, '${ingredient.name}', '${ingredient.quantity}')`;
        await DButils.execQuery(query);
    }
}

async function getMyRecipes(username){
    // Execute SQL query to get recipeIds from MyRecipes table for the current user
    const query = `SELECT recipeId FROM MyRecipes WHERE username = '${username}'`;
    const recipes_id = await DButils.execQuery(query);
    return recipes_id;
}




exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.addToMyRecipes = addToMyRecipes;
exports.getMyRecipes = getMyRecipes;