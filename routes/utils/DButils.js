require("dotenv").config();
const MySql = require("./MySql");

exports.execQuery = async function (query) {
    let returnValue = []
    const connection = await MySql.connection();
    try {
    await connection.query("START TRANSACTION");
    returnValue = await connection.query(query);
    await connection.query("COMMIT");
    } catch (err) {
    await connection.query("ROLLBACK");
    throw err;
    } finally {
    await connection.release();
    }
  return returnValue
}

