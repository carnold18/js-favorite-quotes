// It might be a good idea to add event listener to make sure this file 
// only runs after the DOM has finshed loading. 

// Only call this const when using GET, not with PATCH or DELETE
const embeddedLikesUrl = "http://localhost:3000/quotes?_embed=likes";

// Store all consts together for visual queue regarding what's already been retrieved 
const quotesUrl = "http://localhost:3000/quotes";
const likesUrl = "http://localhost:3000/likes";
const quotesSection = document.querySelector("#quote-list");
const newQuoteForm = document.getElementById("new-quote-form");
const quoteDiv = document.getElementById('new-quote');
const authorDiv = document.getElementById('author');
const sortButton = document.getElementById('sort-button');
let isEditMode = false;
let id = "";
let sortedToggle = false;

// Step 1: Render all existing quotes on page load.
document.addEventListener("DOMContentLoaded",
    getQuotes()
)

function getQuotes() {
    fetch(embeddedLikesUrl)
        .then(response => response.json())
        .then(data => renderQuotes(data))
}

function sortQuotes() {
    console.log(sortedToggle)
    sortedToggle == false ? sortedToggle = true : sortedToggle = false;
    fetch(embeddedLikesUrl)
        .then(response => response.json())
        .then(data => renderQuotes(data))
}

sortButton.addEventListener('click', (event) => sortQuotes(event))

function renderQuotes(quotes) {
    console.log(quotes)
    if (sortedToggle == false) {
        quotesSection.innerHTML = '';
        for (let i = 0; i < quotes.length; i++) {
            let quote = quotes[i];
            let quoteAuthor = quote["author"];
            let quoteString = quote["quote"];
            let quoteLikes = quote["likes"].length;
            quotesSection.innerHTML += `
                <li class='quote-card' id="quote-${quote["id"]}">
                    <blockquote class="blockquote">
                        <p class="mb-0">${quoteString}</p>
                        <footer class="blockquote-footer">${quoteAuthor}</footer>
                        <br>
                        <button class='btn-success'>Likes: <span>${quoteLikes}</span></button>
                        <button class='btn-danger'>Delete</button>
                        <button class='edit-quote'>Edit</button>
                    </blockquote>
                </li>`
        }
    } else if (sortedToggle == true) {
        quotes.sort(function(a, b){
            if(a.author < b.author) { return -1; }
            if(a.author > b.author) { return 1; }
            return 0;
        })
        quotesSection.innerHTML = '';
        for (let i = 0; i < quotes.length; i++) {
            let quote = quotes[i];
            let quoteAuthor = quote["author"];
            let quoteString = quote["quote"];
            let quoteLikes = quote["likes"].length;
            quotesSection.innerHTML += `
                <li class='quote-card' id="quote-${quote["id"]}">
                    <blockquote class="blockquote">
                        <p class="mb-0">${quoteString}</p>
                        <footer class="blockquote-footer">${quoteAuthor}</footer>
                        <br>
                        <button class='btn-success'>Likes: <span>${quoteLikes}</span></button>
                        <button class='btn-danger'>Delete</button>
                        <button class='edit-quote'>Edit</button>
                    </blockquote>
                </li>`
        }
        // sortedToggle = false;
    }
    quotesSection.addEventListener("click", () => handleEvent(event))
}

// Step 2: Add new quote from form and render it on page.
document.addEventListener("submit", addQuoteToApi)
function addQuoteToApi(event) {
    event.preventDefault();
    const quote = quoteDiv.value;
    const author = authorDiv.value;
        if (isEditMode !== true) {
            console.log(isEditMode)
            fetch(quotesUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify({
                    quote: quote,
                    author: author
                })
            })
                .then(response => response.json())
                .then(data => renderNewQuote(data))
        } else if (isEditMode === true) {
            let quote = document.getElementById('edit-quote').value
            let author = document.getElementById('edit-author').value
            fetch(quotesUrl+"/"+id, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    quote: quote,
                    author: author
                })
            })
                .then(response => response.json())
                .then(data => updateQuote(data))
        }
}

function updateQuote(quote) {
    document.getElementById(`edit-quote-form-${id}`).remove();
    let li = document.getElementById(`quote-${id}`);
    li.children[0].children[0].innerText = quote["quote"];
    li.children[0].children[1].innerText = quote["author"];
}

function renderNewQuote(quote) {
    const likes = quote["likes"] !== undefined ? quote["likes"].length : 0
    quotesSection.innerHTML += `
            <li class='quote-card' id="quote-${quote["id"]}">
                <blockquote class="blockquote">
                    <p class="mb-0">${quote["quote"]}</p>
                    <footer class="blockquote-footer">${quote["author"]}</footer>
                    <br>
                    <button class='btn-success'>Likes: <span>${likes}</span></button>
                    <button class='btn-danger'>Delete</button>
                    <button class='edit-quote'>Edit</button>
                </blockquote>
            </li>`
    newQuoteForm.reset();
}

// Step 3: Handle Click Event
// Delete the quote using delete button
// Increase likes using like button.
function handleEvent(event) {
    console.log(event);
    let longId = event.target.parentNode.parentElement.id;
    id = longId.split("-")[1];
    let customUrl = quotesUrl+"/"+id;
    console.log(customUrl);
    if (event.target.className == "btn-danger") {
        fetch(customUrl, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                id: id
            })
        })
            .then(response => response.json())
            .then(event.target.parentElement.parentNode.remove())
    } else if (event.target.className == "btn-success") {
        console.log("im here")
        console.log(id)
        // Let's test this POST using postman to see why it adds value
        // to the coding process
        fetch(likesUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                quoteId: parseInt(id)
            })
        })
            .then(response => response.json())
            .then(data => increaseLikesRender(data))
    } else if (event.target.className == "edit-quote") {
        isEditMode = true;
        console.log(isEditMode)
       event.target.parentElement.parentElement.innerHTML += `
        <form id="edit-quote-form-${id}">
            <div class="form-group">
                <label for="new-quote">Current Quote</label>
                <input type="text" class="form-control" id="edit-quote">
            </div>
            <div class="form-group">
                <label for="Author">Current Author</label>
                <input type="text" class="form-control" id="edit-author">
            </div>
            <button type="click" class="btn btn-primary" id="submit-edit">Submit Edit</button>
         </form>`
        fetch(quotesUrl+"/"+id)
            .then(response => response.json())
            .then(data => getQuoteEditInfo(data))
    } 
}

function increaseLikesRender(like) {
    const item = `quote-${like.quoteId}`
    const li = document.getElementById(item)
    let currentLikeCount = parseInt(li.children[0].children[3].children[0].innerText)
    currentLikeCount+=1
    li.children[0].children[3].children[0].innerText = currentLikeCount;
}

// Step 4: Edit an existing quote.
function getQuoteEditInfo(quote) {
    console.log(quote)
    document.getElementById('edit-quote').value = quote["quote"]
    document.getElementById('edit-author').value = quote["author"]
}