import express from "express";
// import LandingPageController from "../controllers/LandingPageController.js";
import IndexPageController from "../controllers/IndexPageController.js";
import LoginController from "../controllers/loginController.js";
import DashboardController from "../controllers/DashboardController.js"
const router = express.Router();


/* GET home page. */
// router.get('/', LandingPageController.landingPage);
router.get('/', IndexPageController.indexPage);

// router.get('/login', IndexPageController.loginPage);
// router.post('/login', LoginController.loginPost);

router.get('/dashboard', DashboardController.dashboardPage);

router.get('/forum', DashboardController.forumPage);
router.get('/thread/:id', DashboardController.threadPage);

router.get('/chat', DashboardController.chatPage);

router.get('/new-post', DashboardController.newPostPage);
router.post('/new-post', DashboardController.newPost);

// router.get('/post', DashboardController.postPage);
router.get('/post/:id', DashboardController.postPage);

// router.get('/profile/editDescription', DashboardController.editDescription);
// router.post('/profile/editDescription', DashboardController.editDescriptionPost);
// router.post('/profile/deleteDescription', DashboardController.deleteDescription);
router.get('/profile', DashboardController.profilePage);
router.get('/profile/edit', DashboardController.editProfilePage);
router.post('/profile/update', DashboardController.updateProfile);

router.get('/settings', (req, res) => {
    // Perform any necessary logout actions (e.g., clearing session data, destroying tokens, etc.)
    // Redirect the user to the desired page after logout (e.g., home page)
    res.redirect('/');
});

export default router;
