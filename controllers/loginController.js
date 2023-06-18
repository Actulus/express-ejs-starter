import UserModel from "../models/UserModel.js";

async function loginPost(req, res, next) {
    const { username, password } = req.body;

    const isLogged = await UserModel.login(username, password);

    // Perform authentication logic here
    // Check if the username and password are valid

    // Example authentication logic
    if (isLogged) {
        // If authentication is successful, redirect the user to a protected page
        res.locals = { title: "Dashboard", loggedIn: true };
        res.redirect("/dashboard");
    } else {
        // If authentication fails, render the login page again with an error message
        res.locals = { title: "Login", error: "Invalid username or password", loggedIn: false };
        res.render("login");
    }
}


export default {
    loginPost
};
