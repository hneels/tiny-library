/*
Database Schemas and Models for library app
*/

const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');


/* ---- Book ---- */

// book Schema
const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    subject: {
        type: String,
        enum: ['history', 'fiction', 'cookbook', 'political science']
    },
    year: Number,
    copies: Number,
    summary: {
        type: String,
        maxlength: 400
    },
});

// export Book model
module.exports.Book = mongoose.model('Book', bookSchema);;


/* ---- User ---- */

// user schema
const userSchema = new mongoose.Schema({
    first: String,
    last: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['admin', 'patron'],
        default: 'patron'
    },
});

// add the authentication functions to the User model and use email field as username
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

// export User model
module.exports.User = mongoose.model('User', userSchema);


/* ---- Favorite ---- */

// favorite Schema
const favoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    bookId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Book'
    }
});

// export Favorite model
module.exports.Favorite = mongoose.model('Favorite', favoriteSchema);


/* ---- Hold ---- */

// hold Schema
const holdSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    bookId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Book'
    },
    created: {
        type: Date,
        default: Date.now
    }
})

// export Hold model
module.exports.Hold = mongoose.model('Hold', holdSchema);


/* ---- Loan ---- */

// loan Schema
const loanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    bookId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Book'
    },
    borrowed: {
        type: Date,
        default: Date.now
    },
    returned: {
        type: Date
    }
})

// export Loan model
module.exports.Loan = mongoose.model('Loan', loanSchema);