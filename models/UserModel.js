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
        passwordVerify,
        role,
        major,
        year,
        department,
        position,
        section,
    } = user;

    if (password !== passwordVerify) {
        throw new Error("Passwords do not match");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Get a connection
    const conn = db.getConnection();

    try {
        // Start a transaction
        // await conn.beginTransaction();

        // get role id
        const [roleResult] = await conn.query(
            "SELECT id FROM Roles WHERE name = ?",
            [role]
        );

        const roleID = roleResult[0].id;
        // console.log(`roleID: ${roleID[0].id}`);

        // Insert the user into the Users table
        const [userResult] = await conn.query(
            "INSERT INTO Users (name, username, email, password, role_id, profile_pic) VALUES (?, ?, ?, ?, ?, ?)",
            [name, username, email, hashedPassword, roleID, null]
        );

        const userId = userResult.insertId;
        logger.debug(`User with id(${userId}) inserted`);

        // Insert additional data based on the role
        switch (role.toLowerCase()) {
            case "diák":
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
                    [userId, section]
                );
                break;
            default:
                throw new Error("Invalid role");
        }

        // Commit the transaction
        // await conn.commit();

        const userRegistered = await getUserById(userId);
        console.log(userRegistered);
        return userRegistered[0];
    } catch (error) {
        // Rollback the transaction in case of an error
        // await conn.rollback();

        // Handle the error
        logger.debug(`Error creating user: ${error.message}`);
        throw error;
    } finally {
        // Release the connection
        // conn.release();
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
    // console.log(rows);
    const roles = rows.map((row) => row.name);
    return roles;
}

async function getDepartments(role) {
    console.log('Get departments');
    console.log(role);
    if (role !== 'tanár') {
        return [];
    }
    const conn = db.getConnection();
    const query = "SELECT name FROM departments";
    const [rows] = await conn.query(query);
    const departments = rows.map((row) => row.name);
    return departments;
}

async function getMajors(role) {
    console.log('Get majors');
    if (role !== 'diák') {
        return [];
    }
    const conn = db.getConnection();
    const query = "SELECT name FROM majors";
    const [rows] = await conn.query(query);
    const majors = rows.map((row) => row.name);
    return majors;
}

async function getYears(role) {
    console.log('Get years');
    if (role !== 'diák') {
        return [];
    }
    const conn = db.getConnection();
    const query = "SELECT name FROM years";
    const [rows] = await conn.query(query);
    const years = rows.map((row) => row.name);
    return years;
}

async function getPositions(role) {
    console.log('Get positions');
    if (role !== 'munkatárs') {
        return [];
    }
    const conn = db.getConnection();
    const query = "SELECT name FROM positions";
    const [rows] = await conn.query(query);
    const positions = rows.map((row) => row.name);
    return positions;
}

async function getSections(role) {
    console.log('Get sections');
    if (role !== 'adminisztrátor') {
        return [];
    }
    const conn = db.getConnection();
    const query = "SELECT name FROM sections";
    const [rows] = await conn.query(query);
    const sections = rows.map((row) => row.name);
    return sections;
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
    getDepartments,
    getSections,
}