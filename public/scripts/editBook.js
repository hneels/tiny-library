
// add event listeners to Edit buttons
document.querySelectorAll('.editBtn').forEach(btn => {
    btn.addEventListener('click', editClick)
})

// add event listeners to Delete Buttons
document.querySelectorAll('.deleteBtn').forEach(btn => {
    btn.addEventListener('click', deleteClick)
})

// add event listener to Confirm Delete modal button
document.querySelector('#confirmDelete').addEventListener('click', confirmDelete);

// function triggered when 'edit/save' button is clicked
function editClick() {
    // get the book id, the input element, and the copies element
    let bookId = this.dataset.book;
    let inputTd = document.getElementById(`input-${bookId}`);
    let copiesTd = document.getElementById(`copies-${bookId}`);


    // if button says 'edit'
    if (this.innerHTML == 'Edit') {
        // change button appearance
        this.className = 'btn btn-warning editBtn';
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

        // send new # of copies via API (using helper function below)
        postData(`/admin/api/changecopies/${bookId}`, {
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

// function triggered when 'delete' button is clicked
function deleteClick() {

    // when delete is clicked, pass the Book data property into the modal button dataset
    let bookId = this.dataset.book;
    document.querySelector('#confirmDelete').dataset.book = bookId;
}

// function triggered when 'confirm delete' modal button is clicked
function confirmDelete() {
    let bookId = this.dataset.book;

    // send POST request with bookID in path
    postData(`/admin/api/deletebook/${bookId}`, {})
        .then(data => {

            // if success message, delete the whole book row from the DOM
            if (data.success) {
                document.querySelector(`#row-${bookId}`).remove();

            } else {
                // alert with failure, e.g. if book can't be deleted because it's checked out
                alert(data.message);
            }
        })
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
    return await response.json();
}
