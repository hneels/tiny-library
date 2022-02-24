/*
Admin (librarian) routes for library app
All routes have custom isAdmin middleware injected by server.js 
which redirects to login page if user is not an Admin
*/

const express = require('express');
const router = express.Router();
const { Book, User, Favorite, Hold, Loan } = require('../db/models');
const passport = require('passport');
const { format } = require('date-fns');


/* ---- Page for librarian to check out/ check in books to users ---- */
router.get('/admin/loans', async (req, res) => {


    // get all outstanding holds
    let holds = await Hold.aggregate([
        {
            // get the books associated with the holds
            $lookup: {
                from: 'books',
                localField: 'bookId',
                foreignField: '_id',
                as: 'Book'
            }
        },
        {
            // get the users associated with the holds
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'User'
            }
        },
        {
            // get the inner Book and User properties needed
            $addFields: {
                'bookId': '$Book._id',
                'title': '$Book.title',
                'author': '$Book.author',
                'inventory': '$Book.copies',
                'userId': '$User._id',
                'userFirst': '$User.first',
                'userLast': '$User.last'
            }
        },
        {
            // get the outstanding loans for this book (to calculate available copies)
            $lookup: {
                from: 'loans',
                localField: 'bookId',
                foreignField: 'bookId',
                as: 'Loan'
            }
        },
        {
            // retain the needed properties
            $project: {
                bookId: 1,
                title: 1,
                author: 1,
                inventory: 1,
                userId: 1,
                userFirst: 1,
                userLast: 1,
                created: 1,
                loanCount: { $size: "$Loan" } // the number of currently checked out copies
            }
        }
    ]);

    // the number of available copies equals the total inventory minus the copies currently loaned out
    for (let hold of holds) {
        hold.availableCount = hold.inventory - hold.loanCount;
        // if all copies of the book are loaned out, the book is unavailable (to disable button in view)
        if (hold.availableCount < 1) {
            hold.unavailable = true;
        }
    }

    // format the datetime of each hold
    for (let hold of holds) {
        hold.created = format(hold.created, 'MMM d y, h:mmaaa');
    }


    // get all loans that are currently checked out - don't have a RETURNED field
    let currentLoans = await Loan.aggregate([
        {
            // no returned date
            $match: { returned: null }
        },
        {
            // match to Book model
            $lookup: {
                from: 'books',
                localField: 'bookId',
                foreignField: '_id',
                as: 'Book'
            }
        },
        {
            // match to User model
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'User'
            }
        },
        {
            // get the fields of the inner Book and User objects
            $addFields: {
                'bookId': '$Book._id',
                'title': '$Book.title',
                'author': '$Book.author',
                'userId': '$User._id',
                'userFirst': '$User.first',
                'userLast': '$User.last'
            }
        },
        {
            // retain only the needed properties
            $project: {
                bookId: 1,
                title: 1,
                author: 1,
                userId: 1,
                userFirst: 1,
                userLast: 1,
                borrowed: 1
            }
        }
    ])

    // format the datetime of each loan
    for (let loan of currentLoans) {
        loan.borrowed = format(loan.borrowed, 'MMM d y, h:mmaaa');
    }
    res.render('adminLoanView', {
        holds: holds,
        currentLoans: currentLoans
    })

})



/* ---- POST form: check out a book to a user ---- */
router.post('/admin/checkout', async (req, res) => {

    try {

        let bookId = req.body.bookId;
        let userId = req.body.userId;

        // how many copies of this book exist
        let book = await Book.findById(bookId);
        let totalCopies = book.copies;

        // how many copies of this book are currently checked out
        let loanedCopies = await Loan.find({ returned: null, bookId: bookId }).count()

        // ensure that copies available is more than copies checked out
        if (loanedCopies >= totalCopies) {
            throw new Error('All copies of this book are currently checked out');
        }

        // delete the hold between this book and this user
        await Hold.deleteOne({ userId: userId, bookId: bookId });

        // create a loan between this book and this user. timestamp will be autofilled by model
        await Loan.create({ bookId: bookId, userId: userId });

        // after processing, redirect to loans page
        res.redirect('/admin/loans');

    } catch (error) {
        // flash message to show error
        req.flash('error', error.message);
        // redirect to admin loans page
        res.redirect('/admin/loans');
    }
})



/* ---- POST form: check in a returned book ---- */
router.post('/admin/checkin', async (req, res) => {

    try {
        const userId = req.body.userId;
        const bookId = req.body.bookId;

        // get the loan item between this book and this user
        let loan = await Loan.findOne({ userId: userId, bookId: bookId });

        // insert the returned timestamp, which marks the book returned in the system
        loan.returned = Date.now();
        await loan.save();

        // add flash message to show success
        req.flash('success', 'Book was checked in to the system.');

        // after done processing, redirect to admin loans page
        res.redirect('/admin/loans');

    } catch (error) {
        // flash message to show error
        req.flash('error', error.message);
        // redirect to admin loans page
        res.redirect('/admin/loans');
    }
});




/* ---- Add New Book form: display form to add a book---- */
router.get('/admin/addbook', async (req, res) => {

    // get all the possible book subjects
    const subjects = Book.schema.path('subject').enumValues;

    // render new book form
    res.render('adminBookForm', {
        subjects: subjects
    });

})


/* ---- Add New Book form: receive form data via POST ---- */
router.post('/admin/addbook', async (req, res) => {

    try {

        // get form input
        let { title, author, subject, year, copies, summary } = req.body;

        // don't allow creation if a book with this title and author already exists
        if (await Book.findOne({ title: title, author: author })) {
            throw new Error('That book already exists in the system.');
        }

        // create new book
        await Book.create({
            title: title, author: author, subject: subject, year: year, copies: copies, summary: summary
        })

        // set success flash
        req.flash('success', 'New book was added to inventory.')

        // redirect to All Books page
        res.redirect('/');


    } catch (error) {

        // set failure flash
        req.flash('error', error.message);

        //redirect to book form with flash
        res.redirect('/admin/addbook');
    }
})


/* View page to update existing books (updates are received via apiAdmin.js) */
router.get('/admin/editbooks', async (req, res) => {

    // retrieve all books from db, sorted by author
    let books = await Book.find({}).sort('author').lean();

    res.render('adminEditBooks', {
        books: books
    })
})



module.exports = router;