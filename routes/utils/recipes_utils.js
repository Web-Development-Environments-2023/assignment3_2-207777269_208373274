const DButils = require("./DButils");
const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";




async function getRecipeDetailsFromDb(recipe_id, username) {
    let isSeen, isFavorite;
    if(username) {
        isSeen = false;
        isFavorite = false;
        const viewsQuery = `SELECT * FROM recipelastviews WHERE username = '${username}' AND recipe_id = ${recipe_id}`;
        const recipeViews = await DButils.execQuery(viewsQuery);
        if(recipeViews.length !== 0)
            isSeen = true;

        const favoritesQuery = `SELECT * FROM userfavoriterecipes WHERE username = '${username}' AND recipe_id = ${recipe_id}`;
        const favoriteArray = await DButils.execQuery(favoritesQuery);
        if(favoriteArray.length !== 0)
            isFavorite = true;
    }
    return {isSeen:isSeen, isFavorite:isFavorite};
}




async function getRecipeInformation(recipe_id, username) {
    let recipeResponse = await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
    return Object.assign(recipeResponse.data, await getRecipeDetailsFromDb(recipe_id, username));
}




async function getRecipePreviewDetails(recipeId, username) {
    const recipeInfo = await getRecipeInformation(recipeId, username);
    const { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, isSeen, isFavorite, summary } = recipeInfo;

    return {
        recipe_id: id,
        title: title,
        ready_in_minutes: readyInMinutes,
        image: image,
        aggregate_likes: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        gluten_free: glutenFree,
        is_seen: isSeen,
        is_favorite: isFavorite,
        summary: summary
    }
}




async function getRecipeFullDetails(recipeId, username) {
    const recipeInfo = await getRecipeInformation(recipeId, username);
    const { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, instructions,analyzedInstructions, extendedIngredients, servings, isSeen, isFavorite,summary } = recipeInfo;

    return {
        recipe_id: id,
        title: title,
        ready_in_minutes: readyInMinutes,
        image: image,
        aggregate_likes: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        gluten_free: glutenFree,
        analyzed_instructions: analyzedInstructions,
        instructions: instructions,
        extended_ingredients: extendedIngredients,
        portions: servings,
        is_seen: isSeen,
        is_favorite: isFavorite,
        summary: summary
    }
}




async function getRecipesPreview(recipesIdArray, username) {
    let previewsArray = [];
    for(let recipeId of recipesIdArray){
        previewsArray.push(await getRecipePreviewDetails(recipeId, username));
    }

    return previewsArray;
}




async function searchRecipe(recipeName, cuisine, diet, intolerance, number, username) {
    const response = await axios.get(`${api_domain}/complexSearch`, {
        params: {
            query: recipeName,
            cuisine: cuisine,
            diet: diet,
            intolerances: intolerance,
            number: number,
            apiKey: process.env.spooncular_apiKey
        }
    });

    return getRecipesPreview(response.data.results.map((element) => element.id), username);
}




async function getRandomRecipes(number, username) {
    const response = await axios.get(`${api_domain}/random`, {
        params: {
            number: number,
            apiKey: process.env.spooncular_apiKey
        }
    });

    let previews_array = [];
    for(let fullRecipe of response.data.recipes){
        const { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, summary } = fullRecipe;
        const { isSeen, isFavorite } = await getRecipeDetailsFromDb(id, username);

        previews_array.push({
            recipe_id: id,
            title: title,
            ready_in_minutes: readyInMinutes,
            image: image,
            aggregate_likes: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            gluten_free: glutenFree,
            is_seen: isSeen,
            is_favorite: isFavorite,
            summary: summary
        });
    }

    return previews_array;
}




async function markAsSeen(username, recipe_id){
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let markAsSeenQuery = `INSERT INTO RecipeLastViews (username, recipe_id, last_view_time) 
                VALUES ('${username}', ${recipe_id}, '${timestamp}')
                 ON DUPLICATE KEY UPDATE last_view_time = '${timestamp}'`;
    await DButils.execQuery(markAsSeenQuery);
}




exports.getRecipePreviewDetails = getRecipePreviewDetails;
exports.getRecipeFullDetails = getRecipeFullDetails;
exports.searchRecipe = searchRecipe;
exports.getRandomRecipes = getRandomRecipes;
exports.markAsSeen = markAsSeen;
exports.getRecipesPreview = getRecipesPreview;