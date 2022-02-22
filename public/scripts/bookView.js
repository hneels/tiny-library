

// button elements
const loanButton = document.getElementById('loanButton');
const favButton = document.getElementById('favButton');

// the book object's _id to send with fetch
const bookId = favButton.dataset.book;


// event listener for hold button
loanButton.addEventListener('click', () => {
    postData('/api/hold', { bookId: bookId })
        .then(data => {

            // if the message received is "hold placed", update the button accordingly
            if (data.message == 'hold placed') {
                loanButton.innerHTML = 'Remove Hold'

                // if the message received is "hold removed", update the button accordingly
            } else if (data.message == 'hold removed') {
                loanButton.innerHTML = 'Place Hold'

                // some kind of error message received
            } else {
                alert(data.message);
            }
        })
})


// event listener for favorite button
favButton.addEventListener('click', () => {
    postData('/api/favorite', { bookId: bookId })
        .then(data => {

            // if the message received is "favorite added", update the button accordingly
            if (data.message == 'favorite added') {
                favButton.innerHTML = 'Remove from Favorites';

                // if the message received is "favorite removed", update the button accordingly
            } else if (data.message == 'favorite removed') {
                favButton.innerHTML = 'Add to Favorites';

                // else the message is "failure", display alert
            } else {
                alert(data.message);
            }
        })
})




// helper function to send a post request
async function postData(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    return response.json();
}
