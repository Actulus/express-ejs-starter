import { __dirname } from "../app.js";
import UserModel from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// get

async function loginPage(_req, res, _next) {
    res.locals = {
        title: "Login",
    };
    console.log(_req.body);
    res.render("login");
}

async function registerPage(_req, res, _next) {
    const roles = await UserModel.getRoles();
    const departments = await UserModel.getDepartments("tanár");
    const positions = await UserModel.getPositions("munkatárs");
    const majors = await UserModel.getMajors("diák");
    const years = await UserModel.getYears("diák");
    const sections = await UserModel.getSections("adminisztrátor");

    res.locals = {
        title: "Register",
        roles,
        departments,
        positions,
        majors,
        years,
        sections
    };
    res.render("register");
}

// post
async function login(_req, res, _next) {
    const { username, password } = _req.body;
    console.log(_req.body);
    try {
        const user = await UserModel.findOne(username);
        if (!user) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }
        console.log(user.password);
        console.log(password);
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        // save jwt token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        // redirect to home page
        return res.redirect("/dashboard");
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

async function register(req, res, _next) {
    const { username, name, email, password, passwordVerify, role, major, year, department, position, sections } = req.body;
    console.log(req.body);
    try {
        const user = await UserModel.createUser({
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
            sections
        });
        // console.log(user);
        // console.log(process.env.JWT_SECRET);
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        // save jwt token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        // redirect to home page
        return res.redirect("/dashboard");
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

async function logout(_req, res, _next) {
    res.clearCookie("token");
    return res.redirect("/");
}

export default {
    login,
    register,
    loginPage,
    registerPage,
    logout,
};