var express = require("express");
var router = express.Router();
const MySql = require("../routes/utils/MySql");
const DButils = require("../routes/utils/DButils");
const bcrypt = require("bcrypt");



router.post("/Register", async (req, res, next) => {
  try {
    // parameters exists
    // valid parameters
    // username exists
    let user_details = {
      username: req.body.username,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      country: req.body.country,
      password: req.body.password,
      email: req.body.email,
    }
    let users = [];
    users = await DButils.execQuery("SELECT username from Users");

    if (users.find((x) => x.username === user_details.username))
      throw { status: 409, message: "Username taken" };

    // add the new username
    let hash_password = bcrypt.hashSync(
      user_details.password,
      parseInt(process.env.bcrypt_saltRounds)
    );
    await DButils.execQuery(
      `INSERT INTO Users (username, first_name, last_name, country, password, email) 
      VALUES ('${user_details.username}', '${user_details.first_name}', '${user_details.last_name}', 
      '${user_details.country}', '${hash_password}', '${user_details.email}')`
    );
    res.status(201).send({ message: "user created", success: true });
  } catch (error) {
    next(error);
  }
});



router.post("/Login", async (req, res, next) => {
    try {
        // check that user is not already logged in
        if (req.session.username)
            throw { status: 409, message: "A user is already logged in" };
    
        // check that username exists
        const users = await DButils.execQuery("SELECT username FROM Users");
        if (!users.find((x) => x.username === req.body.username))
            throw { status: 401, message: "Username or Password incorrect" };

        // check that the password is correct
        const user = (
            await DButils.execQuery(`SELECT * FROM Users 
                                     WHERE username = '${req.body.username}'`)
        )[0];

        if (!bcrypt.compareSync(req.body.password, user.password)) {
            throw { status: 401, message: "Username or Password incorrect" };
        }

        // Set cookie
        req.session.username = user.username;
        console.log(req.session);
        // return cookie
        res.status(200).send({ message: "login succeeded", success: true });
    } catch (error) {
        next(error);
    }
});


router.post("/Logout", function (req, res) {
    req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
    res.send({ success: true, message: "logout succeeded" });
});


module.exports = router;