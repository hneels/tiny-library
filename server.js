/*
Author: Hope Asher
cs602 final project: Tiny Library

Learned Passport from these tutorials:
https://heynode.com/tutorial/authenticate-users-node-expressjs-and-passportjs/
https://youtu.be/F-sFp_AvHc8
https://www.geeksforgeeks.org/node-js-authentication-using-passportjs-and-passport-local-mongoose/

*/


/* ---- Database Connection and Models ---- */
const connection = require('./db/dbconnect');
const models = require('./db/models');
const mongoose = require('mongoose');



/* ---- Express Middleware ---- */

// Express setup
const express = require('express');
const app = express();

// sections to add custom script section into views
const sections = require('express-handlebars-sections');

// Handlebars middleware with sections
const { engine } = require('express-handlebars');
// set Handlebars as view engine with sections helper
app.engine('handlebars', engine({
    defaultLayout: 'main',
    helpers: {
        section: sections()
    }
}));
app.set('view engine', 'handlebars');


// middleware for sessions and passport
const session = require('express-session');
const passport = require('passport');

// store the sessions in MongoDB
const MongoStore = require('connect-mongo')(session);
const sessionStore = new MongoStore({
    mongooseConnection: mongoose.connection,
    collection: 'sessions'
});

// add sessions middleware
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { maxAge: 60 * 60 * 1000 * 24 * 7 } // 1 week
}));

// initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// authentication strategy (using passport-local-mongoose in models)
passport.use(models.User.createStrategy());

// serialize the user with sessions
passport.serializeUser(models.User.serializeUser());
passport.deserializeUser(models.User.deserializeUser());

// serve static files from public folder
app.use(express.static(__dirname + '/public'));

// body-parser included with Express
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Express flash message middleware
const flash = require('express-flash');
app.use(flash());



/* ---- Custom Middleware ---- */

// custom flash middleware to take flash messages off the request and put them in res.locals
// to be displayed in Bootstrap alerts
const customFlash = require('./middleware/custom-flash');
app.use(customFlash);

// custom user middleware to append the user onto the response.locals
const customUser = require('./middleware/custom-user');
app.use(customUser);

// custom middleware to only allow authenticated admin to access admin pages
const customAdmin = require('./middleware/custom-admin');
app.use('/admin', customAdmin)

/* ---- Routing ---- */

// patron or unauthenticated user routes
const routes = require('./routes/routes');
app.use(routes);

// patron API: updating favorite/hold list with REST endpoints
const apiPatron = require('./routes/apiPatron');
app.use(apiPatron);

// admin routes
const adminRoutes = require('./routes/adminroutes');
app.use(adminRoutes);

// admin API: updating book info with REST endpoint
const adminApi = require('./routes/apiAdmin');
app.use(adminApi);

// postman/ curl routes (not linked to views & don't render html)
const postmanApi = require('./routes/apiPostman');
app.use(postmanApi);


/* ---- Error Handling ---- */

// middleware to set error message for an invalid URL and pass on to error handler below
app.use((req, res, next) => {
    let err = new Error('Page not found');
    err.status = 404;
    next(err);
});

// error handler: will set status to 500 if it's a database error that wasn't set above
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('errorView', {
        message: err.message,
        status: err.status || 500
    });
});



/* ---- Server ---- */

// server on port 3000
app.listen(3000, () => console.log('http://localhost:3000'));