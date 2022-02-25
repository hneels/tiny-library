/*
Regular patron routes for library app
*/

const express = require('express');
const router = express.Router();
const { Book, User, Favorite, Hold, Loan } = require('../db/models');
const passport = require('passport');
const { ensureLoggedIn } = require('connect-ensure-login');
const { format } = require('date-fns');


/* ---- HOME page: display all books ---- */
router.get('/', async (req, res) => {

    // retrieve all books from db, sorted by author
    let books = await Book.find({}).sort('author').lean();

    // render view with context
    res.render('home', {
        'books': books
    });
});


/* ---- page to view an individual book ---- */
router.get('/book/:id', async (req, res, next) => {

    try {
        let bookId = req.params.id;
        // retrieve the book by its id and return as an object
        let book = await Book.findById(bookId).lean();

        let favorite, hold, checkedOut = false;

        // if user is logged in, retrieve this book's status on Favorite and Hold lists
        if (req.isAuthenticated()) {

            let userId = req.user._id;

            // does this user have this book as a Favorite
            let faveResult = await Favorite.find({ 'userId': userId, 'bookId': bookId });
            // favorite boolean is true if this book is on user's favorite list and false if not
            favorite = faveResult.length > 0 ? true : false;

            // does this user have this book in their Hold requests
            let holdResult = await Hold.find({ 'userId': userId, 'bookId': bookId });
            hold = holdResult.length > 0 ? true : false;

            // does this user have this book currently checked out
            let loanResult = await Loan.find({ 'userId': userId, 'bookId': bookId, 'returned': null });
            checkedOut = loanResult.length > 0 ? true : false;
        }

        // render book view with book data and books list booleans
        res.render('bookView', {
            book: book,
            favorite: favorite,
            hold: hold,
            checkedOut: checkedOut
        });
    } catch (err) {
        // display the error on a 404 page (will be caught in last middleware in libraryapp.js)
        err.message = 'invalid book ID';
        next(err);
    }
});


/* ---- Login page ---- */
router.get('/login', (req, res) => {
    res.render('loginView');
});

// use Passport for login
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));


/* ---- Logout Page ---- */
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});


/* ---- Register page ---- */
router.get('/register', (req, res) => {
    res.render('registerView');
})

router.post('/register', async (req, res, next) => {
    try {
        // get form data
        let { first, last, email, password, confirm } = req.body;

        // display flash error message if passwords not entered correctly
        if (password != confirm) {
            req.flash('error', 'Passwords must match');
            res.redirect('/register');
        } else {
            // create the user
            let newUser = new User({ first: first, last: last, email: email });
            await User.register(newUser, password);

            // redirect to login page with flash success message
            req.flash('success', 'Account created. Please log in');
            res.redirect('/login');
        }

    } catch (err) {
        // if there was a problem registering the new user in database, show the error as flash message
        req.flash("error", err.message);
        res.redirect('/register');
    }
});

/* ---- Search results page (submitted from form embedded in navbar) ---- */
router.get('/search', async (req, res) => {

    // get the user's phrase submitted in form
    let phrase = req.query.phrase;

    // find all books where the phrase is in the title, author, or subject
    let books = await Book.find({
        $or: [
            { title: { $regex: phrase } },
            { author: { $regex: phrase } },
            { subject: { $regex: phrase } }
        ]
    }).lean();

    res.render('searchView', {
        books: books,
        phrase: phrase
    })
})

/* ---- User's favorite books page ---- */
router.get('/favorites', ensureLoggedIn(), async (req, res) => {
    const userId = req.user._id;

    // get all of this user's favorite books
    const result = await Favorite.aggregate([
        {
            $match: { userId: userId }
        },
        {
            // join to Book collection
            $lookup: {
                from: 'books',
                localField: 'bookId',
                foreignField: '_id',
                as: 'FaveBook'
            }
        },
        {
            $unwind: '$FaveBook'
        }
    ]);
    // for each result, retrieve the inner object containing the book information
    let books = result.map(eachResult => eachResult.FaveBook);

    res.render('favoriteView', {
        books: books
    })
})


/* ---- Page showing a user's current loans and pending holds----*/
router.get('/loansandholds', ensureLoggedIn(), async (req, res) => {

    const userId = req.user._id;

    // retrieve this user's holds
    let holds = await Hold.aggregate([
        {
            // get all holds from this user
            $match: { userId: userId }
        },
        {
            // match the holds to their book objects
            $lookup: {
                from: 'books',
                localField: 'bookId',
                foreignField: '_id',
                as: 'Book'
            },
        },
        {
            // retrieve the inner Book properties needed
            $addFields: {
                '_id': '$Book._id',
                'title': '$Book.title',
                'author': '$Book.author',
            }
        },
        {
            // filter the needed fields for the display and format the date
            $project: {
                _id: 1,
                title: 1,
                author: 1,
                created: 1
            }
        },
        {
            // sort by Hold date
            $sort: { created: 1 }
        }
    ]);

    // format the datetime of each hold
    for (let hold of holds) {
        hold.created = format(hold.created, 'MMM d y, h:mmaaa');
    }

    // get currently loaned books: any books loaned by this user that haven't yet been returned
    let loans = await Loan.aggregate([
        {
            // get all loans from this user that DON'T have a returned date
            $match: {
                userId: userId,
                returned: null
            }
        },
        {
            // match the outstanding loans to their book objects
            $lookup: {
                from: 'books',
                localField: 'bookId',
                foreignField: '_id',
                as: 'Book'
            },
        },
        {
            // retrieve the inner Book properties needed
            $addFields: {
                '_id': '$Book._id',
                'title': '$Book.title',
                'author': '$Book.author',
            }
        },
        {
            // filter the needed fields
            $project: {
                _id: 1,
                title: 1,
                author: 1,
                borrowed: 1
            }
        },
        {
            // sort by loan date with most recent first
            $sort: { borrowed: -1 }
        }
    ]);

    // format the datetime of each hold
    for (let loan of loans) {
        loan.borrowed = format(loan.borrowed, 'MMM d y, h:mmaaa');
    }

    res.render('loanView', {
        holds: holds,
        loans: loans
    })
})


/* ---- Page showing a user's checkout history (any books that have been returned) ---- */
router.get('/history', ensureLoggedIn(), async (req, res) => {
    const userId = req.user._id;

    // get past loans: any Loan objects that have a returned date
    let pastLoans = await Loan.aggregate([
        {
            // get all loans from this user that do have a returned date
            $match: {
                userId: userId,
                returned: { $exists: true }
            }
        },
        {
            // match the outstanding loans to their book objects
            $lookup: {
                from: 'books',
                localField: 'bookId',
                foreignField: '_id',
                as: 'Book'
            },
        },
        {
            // retrieve the inner Book properties needed
            $addFields: {
                '_id': '$Book._id',
                'title': '$Book.title',
                'author': '$Book.author',
            }
        },
        {
            // filter the needed fields
            $project: {
                _id: 1,
                title: 1,
                author: 1,
                borrowed: 1,
                returned: 1
            }
        },
        {
            // sort by date with most recently returned first
            $sort: { returned: -1 }
        }
    ]);

    // format the borrowed and returned dates
    for (let loan of pastLoans) {
        loan.borrowed = format(loan.borrowed, 'MMM d y, h:mmaaa');
        loan.returned = format(loan.returned, 'MMM d y, h:mmaaa');
    }

    res.render('historyView', {
        pastLoans: pastLoans
    })
})

module.exports = router;