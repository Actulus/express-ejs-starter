import UserModel from "../models/UserModel.js";

async function testPage(_req, res, _next) {
    await UserModel.getUserById(0);

    res.locals = { connected: true };
    res.render('db-test');
}

export default {
    testPage
}