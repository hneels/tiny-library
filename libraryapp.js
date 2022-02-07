/*
Author: Hope Asher
cs602 final project: Library App
*/

// set up Express and Handlebars
const express = require('express');
const { engine } = require('express-handlebars');

const app = express();

// set Handlebars as view engine
app.engine('handlebars', engine({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');


// serve static files from public folder
app.use(express.static('public'));


// 404 error page
app.use((req, res) => {
    res.status(404);
    res.render('404');
})

// server on port 3000
app.listen(3000, () => console.log('http://localhost:3000'));