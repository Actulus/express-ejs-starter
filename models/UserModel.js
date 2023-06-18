import logger from "../utils/logging.js";
import db from '../db/db.js';
import bcrypt from 'bcrypt';

async function getUserById(userID) {
    // Get a connection
    const conn = db.getConnection();

    // Make a query
    const [result, _columnDefinition] = await conn.query('SELECT * FROM users WHERE id = ?', [userID]);

    logger.debug(`User with id(${userID}), %o`, result[0]);

    return result;
}

async function login(username, password) {
    try {
        // Get a connection
        const conn = db.getConnection();

        // Make a query
        const [result, _columnDefinition] = await conn.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);

        // console.log(result);

        if (result.length === 0) {
            logger.debug(`User with username(${username}) and password(${password}) not found`);
            return false;
        }

        logger.debug(`User with username(${username}), %o`, result[0]);
        return true;
    }
    catch (err) {
        logger.error(err);
    }

}

// create a new user
async function createUser(user) {
    const {
        username,
        name,
        email,
        password,
        role,
        major,
        year,
        department,
        position,
        sections,
    } = user;

    if (password[0] !== password[1]) {
        throw new Error("Passwords do not match");
    }

    const hashedPassword = await bcrypt.hash(password[0], 10);

    // Get a connection
    const conn = db.getConnection();

    try {
        // Start a transaction
        await conn.beginTransaction();

        // Insert the user into the Users table
        const [userResult] = await conn.query(
            "INSERT INTO Users (username, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
            [username, name, email, hashedPassword, role]
        );

        const userId = userResult.insertId;
        logger.debug(`User with id(${userId}) inserted`);

        // Fetch roles and majors
        const roles = await getRoles();
        const majors = await getMajors();

        // Insert additional data based on the role
        switch (role.toLowerCase()) {
            case "diák":
                if (!majors.includes(major)) {
                    throw new Error("Invalid major");
                }
                await conn.query(
                    "INSERT INTO Students (user_id, major, year) VALUES (?, ?, ?)",
                    [userId, major, year]
                );
                break;
            case "tanár":
                await conn.query(
                    "INSERT INTO Teachers (user_id, department) VALUES (?, ?)",
                    [userId, department]
                );
                break;
            case "munkatárs":
                await conn.query(
                    "INSERT INTO Employees (user_id, position) VALUES (?, ?)",
                    [userId, position]
                );
                break;
            case "adminisztrátor":
                await conn.query(
                    "INSERT INTO Administrators (user_id, section) VALUES (?, ?)",
                    [userId, sections]
                );
                break;
            default:
                throw new Error("Invalid role");
        }

        // Commit the transaction
        await conn.commit();

        const userRegistered = await getUserById(userId);
        console.log(userRegistered);
        return userRegistered[0];
    } catch (error) {
        // Rollback the transaction in case of an error
        await conn.rollback();

        // Handle the error
        logger.debug(`Error creating user: ${error.message}`);
        throw error;
    } finally {
        // Release the connection
        conn.release();
    }
}


async function findOne(username) {
    try {
        // Get a connection
        const conn = db.getConnection();

        // Make a query
        const [result, _columnDefinition] = await conn.query(
            "SELECT * FROM Users WHERE username =?",
            [username]
        );

        logger.debug(`User with id(${result[0].id}) found`);
        return result[0];
    } catch (error) {
        // Handle the error
        logger.debug(`Error finding user: ${error.message}`);
        throw error;
    } finally {
        // Release the connection
        // conn.release();
    }
}

async function getRoles() {
    const conn = db.getConnection();
    const query = "SELECT name FROM roles";
    const [rows] = await conn.query(query);
    console.log(rows);
    const roles = rows.map((row) => row.name);
    return roles;
}

async function getMajors(role) {
    const conn = db.getConnection();
    const query = "SELECT name FROM majors WHERE role = ?";
    const [rows] = await conn.query(query, [role]);
    const majors = rows.map((row) => row.name);
    return majors;
}

async function getYears(role) {
    const conn = db.getConnection();
    const query = "SELECT name FROM years WHERE role = ?";
    const [rows] = await conn.query(query, [role]);
    const majors = rows.map((row) => row.name);
    return majors;
}

async function getPositions(role) {
    const conn = db.getConnection();
    const query = "SELECT name FROM positions WHERE role = ?";
    const [rows] = await conn.query(query, [role]);
    const majors = rows.map((row) => row.name);
    return majors;
}


export default {
    getUserById,
    login,
    createUser,
    findOne,
    getRoles,
    getMajors,
    getYears,
    getPositions,
}