const DButils = require("./DButils");
const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";




async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}




async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree
    }
}




async function getRecipesPreview(recipes_id_array) {
    let previews_array = [];
    for(let recipeId of recipes_id_array){
        previews_array.push(await getRecipeDetails(recipeId));
    }

    return previews_array;
}




async function searchRecipe(recipeName, cuisine, diet, intolerance, number) {
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

    return getRecipesPreview(response.data.results.map((element) => element.recipe_id));
}




async function getRandomRecipes(number) {
    const response = await axios.get(`${api_domain}/random`, {
        params: {
            number: number,
            apiKey: process.env.spooncular_apiKey
        }
    });
    let previews_array = [];
    for(let fullRecipe of response.data.recipes){
        let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = fullRecipe;
        previews_array.push({
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree
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




exports.getRecipeDetails = getRecipeDetails;
exports.searchRecipe = searchRecipe;
exports.getRandomRecipes = getRandomRecipes;
exports.markAsSeen = markAsSeen;
exports.getRecipesPreview = getRecipesPreview;