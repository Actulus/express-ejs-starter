import mysql2 from 'mysql2';
import config from './config.js';

const promisePool = mysql2.createPool(config);

function getConnection() {
    return promisePool.promise();
}

export default {
    getConnection
}