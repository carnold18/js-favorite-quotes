// It might be a good idea to add event listener to make sure this file 
// only runs after the DOM has finshed loading. 

const quotesUrl = 'http://localhost:3000/quotes?_embed=likes'
const quotesUl = document.getElementById('quote-list')
const quotesPostUrl = 'http://localhost:3000/quotes'
const likesUrl = 'http://localhost:3000/likes'
const form = document.getElementById('new-quote-form')

// Step 1: Render all existing quotes on page load.

document.addEventListener("DOMContentLoaded", function() {
    getQuotes()
    form.addEventListener("submit", submitFormOnClick)
    quotesUl.addEventListener("click", (e) => handleEvent(e))
    }
)

function getQuotes() {
    fetch(quotesUrl)
        .then(response => response.json())
        .then(data => renderQuotes(data))
}

function renderQuotes(quotes) {
    // console.log(quotes)
    quotes.forEach(quote => {
        createQuoteItem(quote)
    })
}

function createQuoteItem(quote) {
    // if (quote.id == )
    if (document.getElementById(quote.id)) {
        document.getElementById(quote.id).remove()
    }
    quotesUl.innerHTML += `
        <li class='quote-card' id=${quote.id}>
            <blockquote class="blockquote">
            <p class="mb-0">${quote.quote}</p>
            <footer class="blockquote-footer">${quote.author}</footer>
            <br>
            <button class='btn-success'>Likes: <span>${ quote.likes ? quote.likes.length : 0}</span></button>
            <button class='btn-danger'>Delete</button>
            </blockquote>
        </li>`
        // const deleteButton = document.querySelector('.btn-danger')
        // // console.log(deleteButton)
        // deleteButton.addEventListener("click", (e) => deleteQuote(e))
}

// Step 2: Add new quote from form and render it on page.

function submitFormOnClick(event) {
    event.preventDefault()
    // debugger
    let quote = document.getElementById('new-quote').value
    let author = document.getElementById('author').value
    form.reset()
    // console.log(quote)
    // console.log(author)
    fetch(quotesPostUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: JSON.stringify({
            quote, author
        })
    })
        .then(response => response.json())
        .then(data => createQuoteItem(data))
}

// Step 3: Handle Click Event
// Delete the quote using delete button
// Increase likes using like button.

function handleEvent(e) {
    console.log(e.target)
    let quoteElement = e.target.parentElement.parentElement
    let id = e.target.parentElement.parentElement.id
// delete selected item from the view and from the database
    if (e.target.className == 'btn-danger') {
        // debugger
        fetch(quotesPostUrl+"/"+id, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify({
                id
            })
        })
            .then(response => response.json())
            .then(() => removeQuote(quoteElement))
    } else if (e.target.className == "btn-success") {
        fetch(likesUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify({
                quoteId: parseInt(id)
            })
        })
            .then(response => response.json())
            .then(data => getCurrentLikes(data))
    }
}

function getCurrentLikes(like) {
    let id = like.quoteId
    let url = `http://localhost:3000/quotes/${id}?_embed=likes`
    fetch(url)
        .then(resp => resp.json())
        .then(data => createQuoteItem(data))
}

// function updateLikes(quote) {

// }

function removeQuote(quote) {
    quote.remove()
}

// Step 4: Edit an existing quote.