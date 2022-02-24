/* 
run this once at app start if the database is empty to seed the books collection with book data
*/

const db = require('./db');
const models = require('./models');

(async () => {

    // completely clear the database if exists
    await models.Book.deleteMany({});
    await models.Favorite.deleteMany({});
    await models.Hold.deleteMany({});
    await models.Loan.deleteMany({});
    await models.User.deleteMany({});

    // seed with new book data
    await new models.Book({
        title: 'A Little Life',
        author: 'Hanya Yanagihara',
        subject: 'fiction',
        year: 2015,
        copies: 4,
        summary: 'A tragic and transcendent hymn to brotherly love, a masterful depiction of heartbreak, and a dark examination of the tyrrany of memory and the limits of human endurance.'
    }).save();

    await new models.Book({
        title: 'The People in the Trees',
        author: 'Hanya Yanagihara',
        subject: 'fiction',
        year: 2013,
        copies: 2,
        summary: 'An anthropological adventure story with a profound and tragic vision of what happens when cultures collide.'
    }).save();

    await new models.Book({
        title: 'Swing Time',
        author: 'Zadie Smith',
        subject: 'fiction',
        year: 2016,
        copies: 1,
        summary: 'A story about friendship and music and stubborn roots, about how we are shaped by these things and how we can survive them. Moving from northwest London to West Africa, this book is an exuberant dance to the music of time.'
    }).save();

    await new models.Book({
        title: 'Freedom',
        author: 'Johnathan Franzen',
        subject: 'fiction',
        year: 2010,
        copies: 1,
        summary: 'An epic of contemporary love and marriage, comically and tragically capturing the temptations and burdens of liberty.'
    }).save();

    await new models.Book({
        title: 'Purity',
        author: 'Johnathan Franzen',
        subject: 'fiction',
        year: 2015,
        copies: 2,
        summary: 'A grand story of youthful idealism, extreme fidelity, and murder: the most daring and penetrating book yet by one of the major writers of our time.'
    }).save();

    await new models.Book({
        title: 'Stalin\'s War',
        author: 'Sean McMeekin',
        subject: 'history',
        year: 2021,
        copies: 1,
        summary: 'A groundbreaking reassessment of the Second World War, this book is essential reading for anyone looking to understand the current world order.'
    }).save();

    await new models.Book({
        title: 'The Russian Revolution: A New History',
        author: 'Sean McMeekin',
        subject: 'history',
        year: 2017,
        copies: 2,
        summary: 'The first comprehensive history of these momentous events in two decades, this book combines cutting-edge scholarship and a fast-paced narrative to shed light on one of the most significant turning points of the twentieth century.'
    }).save();

    await new models.Book({
        title: 'Stalin: Paradoxes of Power',
        author: 'Stephen Kotkin',
        subject: 'history',
        year: 2014,
        copies: 1,
        summary: 'The product of a decade of intrepid research, this book is a landmark work that recasts the way we think about the Soviet Union, the twentieth century, and the art of history itself.'
    }).save();

    await new models.Book({
        title: 'Political Order and Political Decay',
        author: 'Francis Fukuyama',
        subject: 'political science',
        year: 2014,
        copies: 1,
        summary: 'A sweeping, masterful account of the struggle to create a well-functioning modern state... destined to be a classic.'
    }).save();

    await new models.Book({
        title: 'The Origins of Political Order',
        author: 'Francis Fukuyama',
        subject: 'political science',
        year: 2011,
        copies: 1,
        summary: 'A brilliant, provocative work that offers fresh insights into the origins of democratic society and raises essential questions about the nature of politics and its discontents.'
    }).save();

    // exit script
    process.exit();

})();
