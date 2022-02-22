/* 
database CONNECTION for library app
*/

const mongoose = require('mongoose');

// connect to database and log errors
const dbUrl = 'mongodb://localhost:27017/librarydb';
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(error => console.log(error));


// close the connection when application terminates
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log("Mongoose connection closed");
        process.exit(0);
    });
});
