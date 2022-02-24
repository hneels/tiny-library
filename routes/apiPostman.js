/*
API REST Endpoints for querying DB data with Postman or Curl.
These routes respond to API GET requests with JSON/XML data.
They do not feed data into the website's views as the apiPatron and apiAdmin routes do.
*/

const express = require('express');
const router = express.Router();
const { Book } = require('../db/models');
const { create } = require('xmlbuilder2');


/* get all books */
router.get('/api/getbooks', async (req, res) => {

    let books = await Book.find({}).lean();

    res.format({
        'application/json': () => {
            res.json(books);
        },

        'application/xml': () => {

            // build XML document (function defined below)
            let doc = xmlBookHelper(books);

            res.type('application/xml').send(doc);
        }
    })
})


/* 
get any books that have a specific phrase in the title
for example, "Stalin" will return "Stalin's War" and "Stalin: Paradoxes of Power".
can also match exact book titles, but the spaces must be encoded with %20 e.g.
A%20Little%20Life
*/
router.get('/api/getbooks/title/:title', async (req, res) => {

    // get all books by this author
    let title = req.params.title;
    let books = await Book.find({ title: { $regex: title } }).lean();

    res.format({
        'application/json': () => {
            res.json(books);
        },
        'application/xml': () => {

            // build XML document
            let doc = xmlBookHelper(books);

            res.type('application/xml').send(doc);
        }
    })
})


/* 
get all books by a certain author 
note when testing: space in name must be encoded with %20 e.g.
Johnathan%20Franzen
*/
router.get('/api/getbooks/author/:author', async (req, res) => {

    let author = req.params.author;
    let books = await Book.find({ author: author }).lean();

    res.format({
        'application/json': () => {
            res.json(books);
        },
        'application/xml': () => {

            // build XML document
            let doc = xmlBookHelper(books);

            res.type('application/xml').send(doc);
        }
    })
})


// helper function to take a JSON object and convert it to XML books document
function xmlBookHelper(books) {

    // build XML document
    let doc = create({ version: '1.0' }).doc();
    let root = doc.ele('books');

    // create nodes for each book
    for (const book of books) {
        let node = root.ele('book');
        node.ele('id').txt(book._id);
        node.ele('title').txt(book.title);
        node.ele('author').txt(book.author);
        node.ele('subject').txt(book.subject);
        node.ele('year').txt(book.year);
        node.ele('copies').txt(book.copies);
        node.ele('summary').txt(book.summary);
    }
    return doc.end({ prettyPrint: true });
}



module.exports = router;