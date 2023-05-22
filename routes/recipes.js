var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");



router.get("/", (req, res) => res.send("im here"));



/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});



//NEW FUNCTIONS
// For searching a recipe
router.get("/search", async (req, res, next) => {
  try {
    const recipeName = req.query.recipeName;
    const cuisine = req.query.cuisine;
    const diet = req.query.diet;
    const intolerance = req.query.intolerance;
    const number = req.query.number || 5; // default is 5
    const results = await recipes_utils.searchRecipe(recipeName, cuisine, diet, intolerance, number);
    req.session.lastSearch = results;
    res.send(results);
  } catch (error) {
    next(error);
  }
});



// For getting 3 random recipes
router.get("/random", async (req, res, next) => {
  try {
    const recipes = await recipes_utils.getRandomRecipes();
    res.send(recipes);
  } catch (error) {
    next(error);
  }
});

//END OF NEW FUNCTIONS

module.exports = router;
