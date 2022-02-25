/*
Custom middleware to check if a user is authenticated as an ADMIN. 
Redirect to login if not.
*/



module.exports = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role == 'admin') {
        next();
    } else {
        res.redirect('/login');
    }
}
