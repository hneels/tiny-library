/*
API routes for Admin (librarian)
All routes have custom isAdmin middleware injected by server.js 
which redirects to login page if user is not an Admin
*/

const express = require('express');
const router = express.Router();
const { Book, User, Favorite, Hold, Loan } = require('../db/models');
const passport = require('passport');


/* ---- REST API endpoint for updating a book's inventory ---- */
router.post('/admin/api/changecopies/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        let newCopyNum = req.body.copyNum;

        // error check that new copies isn't less than currently checked out copies or less than 1
        let loanedCopies = await Loan.find({ returned: null, bookId: bookId }).count();
        if (newCopyNum < loanedCopies || newCopyNum < 1) {
            throw new Error('Number cannot be less than 1, or less than the number of copies currently checked out');
        }

        // update copy number in database
        let book = await Book.findById(bookId);
        book.copies = newCopyNum;
        await book.save();

        // get latest number of copies back from database (re-checking in case another librarian changes the count concurrently)
        book = await Book.findById(bookId, 'copies');
        newCopyNum = book.copies;

        res.status(200).json({ copyUpdate: newCopyNum });

    } catch (error) {

        res.status(400).json({ message: error.message });
    }
})


/* ---- REST API endpoint for deleting a book ---- */
router.post('/admin/api/deletebook/:id', async (req, res) => {
    let bookId = req.params.id;
    try {
        // check that no copies are currently checked out
        let loanedCopies = await Loan.find({ returned: null, bookId: bookId }).count();
        if (loanedCopies > 0) throw new Error('Cannot delete a book that is currently checked out.');

        // delete the book
        await Book.deleteOne({ _id: bookId });

        // delete any holds or favorites associated with the book
        await Hold.deleteMany({ bookId: bookId });
        await Favorite.deleteMany({ bookId: bookId });

        res.status(200).json({ success: 'book deleted' })

    } catch (error) {
        // send error message if book was not found or not deleted
        res.status(400).json({ message: error.message });
    }
})


module.exports = router;