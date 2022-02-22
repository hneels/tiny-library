
// add event listeners to Edit buttons
document.querySelectorAll('.editBtn').forEach(btn => {
    btn.addEventListener('click', btnClick)
})


// event triggered when 'edit/save' button is clicked
function btnClick() {
    // get the book id, the input element, and the copies element
    let bookId = this.dataset.book;
    let inputTd = document.getElementById(`input-${bookId}`);
    let copiesTd = document.getElementById(`copies-${bookId}`)


    // if button says 'edit'
    if (this.innerHTML == 'Edit') {
        // change button appearance
        this.className = 'btn btn-danger editBtn';
        this.innerHTML = 'Save';

        // show input field and hide copies td
        inputTd.style.display = 'block';
        copiesTd.style.display = 'none';

        //if button says 'update'
    } else {
        // change button appearance
        this.className = 'btn btn-primary editBtn';
        this.innerHTML = 'Edit';

        // get the new # of copies from the input field (the child of the td)
        let copyNum = inputTd.firstChild.value;

        // call the function below to send new # of copies via API
        postData('/admin/api/changecopies', {
            bookId: bookId,
            copyNum: copyNum
        })
            .then(data => {
                if (data.copyUpdate) {
                    // update copies number from JSON response
                    copiesTd.innerHTML = data.copyUpdate;

                    // show copies td and hide input field
                    inputTd.style.display = 'none';
                    copiesTd.style.display = 'block';
                } else {
                    alert(data.message)
                }
            })
    }
}


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
