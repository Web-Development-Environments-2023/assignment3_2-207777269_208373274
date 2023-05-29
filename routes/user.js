var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");




/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.username) {
    DButils.execQuery("SELECT username FROM Users").then((users) => {
      if (users.find((x) => x.username === req.session.username)) {
        req.username = req.session.username;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});




/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req, res, next) => {
    try{
        const username = req.session.username;
        const recipeId = req.body.recipe_id;
        await user_utils.addToFavorites(username, recipeId);
        res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
        next(error);
    }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
    try{
        const username = req.session.username;
        const favoriteRecipesId = await user_utils.getFavoriteRecipes(username);
        let recipes_id_array = [];
        favoriteRecipesId.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
        const results = await recipe_utils.getRecipesPreview(recipes_id_array);
        res.status(200).send(results);
    } catch(error){
        next(error); 
    }
});




// For getting recipes from "My Recipes"
router.get('/user_recipes', async (req,res,next) => {
  try{
    const username = req.session.username;
    const myRecipePreview = await user_utils.getMyRecipes(username);
    res.status(200).send(myRecipePreview);
  } catch(error){
    next(error); 
  }
});

// For adding a recipe to "My Recipes"
router.post('/user_recipes', async (req, res, next) => {
  try{
    const username = req.session.username;
    let recipe_details = {
      title: req.body.title,
      image: req.body.image,
      ready_in_minutes: req.body.ready_in_minutes,
      vegetarian: req.body.vegetarian,
      vegan: req.body.vegan,
      gluten_free: req.body.gluten_free,
      ingredients: req.body.ingredients,
      instructions: req.body.instructions,
      portions: req.body.portions
    };

    await user_utils.addToMyRecipes(username, recipe_details);
    res.status(200).send("The Recipe successfully added to My Recipes");
  } catch(error){
    next(error);
  }
})

router.get("/user_recipes/:recipe_id", async (req, res, next) => {
  try {
      const recipe = await recipe_utils.getRecipeDetails(req.params.recipe_id);
      if(req.session.username)
          recipe_utils.markAsSeen(req.session.username, req.params.recipe_id);
      res.send(recipe);
  } catch (error) {
      next(error);
  }
});




// For adding a recipe to "Family Recipes"
router.post('/family_recipes', async (req, res, next) => {
    try{
        const username = req.session.username;
        let recipe_details = {
            title: req.body.title,
            image: req.body.image,
            ready_in_minutes: req.body.ready_in_minutes,
            vegetarian: req.body.vegetarian,
            vegan: req.body.vegan,
            gluten_free: req.body.gluten_free,
            ingredients: req.body.ingredients,
            instructions: req.body.instructions,
            portions: req.body.portions,
            family_member: req.body.family_member,
            traditional_time: req.body.traditional_time,
            images: req.body.images
        };

        await user_utils.addToFamilyRecipes(username, recipe_details);
        res.status(200).send("The Recipe successfully added to Family Recipes");
    } catch(error){
        next(error);
    }
})

// For getting recipes from "Family Recipes"
router.get('/family_recipes', async (req,res,next) => {
    try{
        const username = req.session.username;
        const familyRecipePreview = await user_utils.getFamilyRecipes(username);
        res.status(200).send(familyRecipePreview);
    } catch(error){
        next(error); 
    }
});




// For getting the x last watched recipes
router.get('/last_watched_recipes', async (req,res,next) => {
    try{
        const username = req.session.username;
        const amountToRetrieve = req.query.number;
        const recipesId = await user_utils.getLastWatchedRecipes(username, amountToRetrieve);
        let recipes_id_array = [];
        recipesId.map((element) => recipes_id_array.push(element.recipe_id));
        const results = await recipe_utils.getRecipesPreview(recipes_id_array);
        res.status(200).send(results);
    } catch(error){
        next(error); 
    }
});




module.exports = router;
