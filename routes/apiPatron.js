/*
API routes for regular users (non-admins) of library app
*/

const express = require('express');
const router = express.Router();
const { Book, User, Favorite, Hold, Loan } = require('../db/models');
const passport = require('passport');
const { ensureLoggedIn } = require('connect-ensure-login');



// API route for receiving a Favorite add/remove request
router.post('/api/favorite', ensureLoggedIn(), async (req, res) => {
    try {
        // get the book ID from the fetch and the user from the request
        const bookId = req.body.bookId;
        const userId = req.user._id;

        // check if there already exists a favorite between user and book
        let result = await Favorite.find({ userId: userId, bookId: bookId });

        if (result.length > 0) {
            // if favorite exists, remove favorite and send response
            await Favorite.deleteOne({ userId: userId, bookId: bookId });
            res.status(200).json({ message: 'favorite removed' });

        } else {
            // if no favorite exists, add favorite and send response
            await Favorite.create({ userId: userId, bookId: bookId });
            res.status(200).json({ message: 'favorite added' });
        }

    } catch (error) {
        res.status(404).json({ message: 'request failed' });
    }
})


// API route for receiving a Hold add/ remove request
router.post('/api/hold', ensureLoggedIn(), async (req, res) => {
    try {
        // get the book ID from the fetch and the user from the request
        const bookId = req.body.bookId;
        const userId = req.user._id;

        // check if this user already has a Hold on this book
        let result = await Hold.find({ userId: userId, bookId: bookId });

        if (result.length > 0) {
            // if a hold exists, remove the hold and send response
            await Hold.deleteOne({ userId: userId, bookId: bookId });
            res.status(200).json({ message: 'hold removed' });

        } else {
            // if there is no hold, place a hold on this book and send response
            await Hold.create({ userId: userId, bookId: bookId });
            res.status(200).json({ message: 'hold placed' });
        }

    } catch (error) {
        res.status(404).json({ message: 'request failed' });
    }
})



module.exports = router;