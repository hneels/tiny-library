/*
Custom middleware to check if a user is authenticated as an ADMIN. 
Redirect to login if not.
*/

const { ensureLoggedIn } = require("connect-ensure-login");


module.exports = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role == 'admin') {
        next();
    } else {
        res.redirect('/login');
    }
}
