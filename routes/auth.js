import express from "express";
import AuthController from "../controllers/AuthController.js";
const router = express.Router();

/* GET home page. */
router.get("/login", AuthController.loginPage);
router.get("/register", AuthController.registerPage);
router.get("/logout", AuthController.logout);

router.post("/login", AuthController.login);
router.post("/register", AuthController.register);

export default router;