import express, { json, urlencoded } from "express";
import 'express-async-errors'; // catch async errors in the error handling middleware
import cookieParser from "cookie-parser";
import logger from "morgan";
import path from "path";
import { fileURLToPath } from 'url';

// import routers
import indexRouter from "./routes/index.js";
import dbTestRouter from './routes/db-test.js';
import authRouter from './routes/auth.js';
import errorHandler from "./middlewares/error-handler.js";
import undefinedPage from "./middlewares/undefined-page.js";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// express setup
app.use(logger('dev')); // log every request
app.use(json()); // parse request body JSON
app.use(urlencoded({ extended: false })); // parse request body as urlencoded data
app.use(cookieParser()); // parses cookies, set: res.cookie("name", "value"), get: req.cookies
app.use(express.static(path.join(__dirname, 'public')));

// set routes
app.use('/', indexRouter);
app.use('/db-test', dbTestRouter);
app.use('/auth', authRouter);

// if none of the above match, catch 404 and forward to error handler
app.use(undefinedPage);

// error handler
app.use(errorHandler);

export default app;