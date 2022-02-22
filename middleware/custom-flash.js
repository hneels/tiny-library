/*
Custom flash middleware adapted from Ethan Brown's textbook 'Web Development with Node & Express'
Makes flash messages automatically available in the response on REDIRECTS
The flash.type property encodes the color class for Bootstrap
*/

const flash = require('express-flash');


module.exports = (req, res, next) => {
    // if it's an error message, set the error message and set the color type to danger (for Bootstrap)
    const error = req.flash('error');
    const success = req.flash('success')

    if (error.length > 0) {
        res.locals.flash = {
            type: "danger",
            message: error
        }
        // if it's an success message, set the success message and set the color type to success (for Bootstrap)
    } else if (success.length > 0) {
        res.locals.flash = {
            type: "success",
            message: success
        }
    }
    next();
};