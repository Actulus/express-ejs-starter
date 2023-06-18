import { __dirname } from "../app.js";

function indexPage(_req, res, _next) {
    res.locals = { title: 'Welcome' };
    res.render('index_');
}

function loginPage(_req, res, _next) {
    res.locals = { title: 'Express + EJS', readmeURL: `vscode://file/${__dirname}/README.md` };
    res.render('login');
}

export default {
    indexPage,
    loginPage
}