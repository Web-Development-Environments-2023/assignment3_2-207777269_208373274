const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


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
    let { id, title, image, ready_in_minutes, aggregate_likes, vegetarian, vegan, gluten_free } = recipe_info.data;

    return {
        id: id,
        title: title,
        image: image,
        ready_in_minutes: ready_in_minutes,
        aggregate_likes: aggregate_likes,
        vegetarian: vegetarian,
        vegan: vegan,
        gluten_free: gluten_free
    }
}



exports.getRecipeDetails = getRecipeDetails;



