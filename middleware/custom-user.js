/* 
Custom middleware to retrieve the user from the request, if it exists, and append it to response.locals
This information is used in the main layout and throughout the handlebars views
*/

module.exports = (req, res, next) => {
    if (req.isAuthenticated()) {
        let isAdmin;
        req.user.role == 'admin' ? isAdmin = true : isAdmin = false;
        res.locals.user = {
            _id: req.user._id,
            first: req.user.first,
            last: req.user.last,
            email: req.user.email,
            isAdmin: isAdmin // boolean
        };
    }
    next();
}