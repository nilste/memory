const games = [
    { title: 'Responders', cardAmount: 6, cardFolder: 'responders' },
    { title: 'Wildlife', cardAmount: 5, cardFolder: 'wildlife' }
];

const state = {
    ready: true,
    board: null,
    attempts: 0,
    firstCard: null,
    secondCard: null,
    cardAmount: 0,
    cardFolder: ''
};

function listGames() {
    const gameEl = document.querySelector('#game-select');

    // add a standard pre-selected value
    const standardGame = document.createElement('option');
    standardGame.value = '';
    standardGame.textContent = '-- Random --';
    gameEl.appendChild(standardGame);

    // add all games from the top array
    games.forEach((game, index) => {
        newGameEl = document.createElement('option');
        newGameEl.value = index;
        newGameEl.textContent = game.title;
        gameEl.appendChild(newGameEl);
    });
}

function setupGame() {
    state.ready = true;
    state.attempts = 0;
    state.firstCard = null;
    state.secondCard = null;

    // fetch info about the game type
    const gameEl = document.querySelector('#game-select').selectedOptions.item(0);
    const index = (gameEl.value === '') ? Math.floor(Math.random() * games.length) : gameEl.value;
    state.cardAmount = games[index].cardAmount * 2;
    state.cardFolder = games[index].cardFolder;

    // create board with two cards of each type
    state.board = Array(state.cardAmount);
    let cardNumber = 0;
    for (let i = 0; i != state.cardAmount; ++i) {
        state.board[i] = {
            value: (i % 2) ? cardNumber++ : cardNumber,
            found: false
        }
    }

    shuffleBoard(state.board);
    drawBoard();
}

function shuffleBoard(array) {
    for (let i = array.length - 1; i != 0; --i) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function drawBoard() {
    if (state.cardAmount > 0) {
        // fetch board
        const board = document.querySelector('#board');
        board.innerHTML = '';

        // fill the board with new cards
        for (let i = 0; i != state.cardAmount; ++i) {
            const newCard = document.createElement('div');
            newCard.classList.add('card');
            newCard.setAttribute('data-id', i);

            const newCardFront = document.createElement('div');
            newCardFront.classList.add('front');
            newCardFront.textContent = '?';
            newCard.appendChild(newCardFront);

            const newImage = document.createElement('img');
            newImage.src = 'cards/' + state.cardFolder + '/' + state.board[i].value + '.png';

            const newCardBack = document.createElement('div');
            newCardBack.classList.add('back');
            newCardBack.appendChild(newImage);

            newCard.appendChild(newCardBack);
            board.appendChild(newCard);
        }
    }
}

function runRound(e) {
    const card = e.target.parentElement;
    const cardID = card.dataset.id;

    if (state.ready &&
        card.classList.contains('card') &&
        state.board[cardID].found == false) {

        turnCard(cardID);

        if (state.firstCard == null) {
            state.firstCard = cardID;
        } else {
            state.secondCard = cardID;
        }

        if (state.secondCard != null) {
            ++state.attempts;

            // new variables to deal with setTimeout()
            const card1 = state.firstCard;
            const card2 = state.secondCard;
            state.ready = false;

            // see if there was a match
            if (state.board[card1].value == state.board[card2].value) {
                // update state array
                state.board[card1].found = true;
                state.board[card2].found = true;

                // play success sound
                new Audio('resources/success.mp3').play();

                // hide found cards
                setTimeout(() => {
                    hideCard(card1);
                    hideCard(card2);
                    state.ready = true;
                }, 1200);

                // check if game is won
                if (isGameWon()) {
                    document.querySelector('#attempts').textContent = state.attempts;
                    document.querySelector('#splash').style.display = 'block';
                }
            } else {
                setTimeout(() => {
                    turnCard(card1);
                    turnCard(card2);
                    state.ready = true;
                }, 1200);
            }

            // forget selected cards
            state.firstCard = null;
            state.secondCard = null;
        }
    }
}

function turnCard(cardID) {
    const cardEl = document.querySelector(`[data-id='${cardID}']`);
    cardEl.classList.toggle('flipped');
}

function hideCard(cardID) {
    const cardEl = document.querySelector(`[data-id='${cardID}']`);
    cardEl.classList.add('found');
    cardEl.innerHTML = '';
}

function isGameWon() {
    for (let i = 0; i != state.cardAmount; ++i) {
        if (!state.board[i].found) {
            return false;
        };
    }
    return true;
}

function closeSplash(e) {
    this.removeAttribute('style');
}

window.addEventListener('load', listGames);
window.addEventListener('load', setupGame);
document.querySelector('#button-new').addEventListener('click', setupGame);
document.querySelector('#board').addEventListener('click', runRound);
document.querySelector('#splash').addEventListener('click', closeSplash);