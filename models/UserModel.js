import logger from "../utils/logging.js";
import db from '../db/db.js';

async function getUserById(userID) {
    // Get a connection
    const conn = db.getConnection();

    // Make a query
    const [result, _columnDefinition] = await conn.query('SELECT * FROM users WHERE id = ?', [userID]);

    logger.debug(`User with id(${userID}), %o`, result[0]);

    return result;
}

export default {
    getUserById
}