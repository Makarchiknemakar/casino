let deck = [];
const suits = ["Черви", "Бубни", "Піки", "Трефи"];
const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "Валет", "Дама", "Король", "Туз"];

let dealerCards = [];
let playerCards = [];

let dealerSum = 0;
let playerSum = 0;

let isGameActive = false;


const dealerCardsEl = document.getElementById("dealer-cards");
const playerCardsEl = document.getElementById("player-cards");
const dealerSumEl = document.getElementById("dealer-sum");
const playerSumEl = document.getElementById("player-sum");
const resultEl = document.getElementById("result");
const hitBtn = document.getElementById("hit-btn");
const stayBtn = document.getElementById("stay-btn");
const dealBtn = document.getElementById("deal-btn");


function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
}


function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}


function getCardValue(card) {
    if (card.value === "Туз") return 11;
    if (["Валет", "Дама", "Король"].includes(card.value)) return 10;
    return parseInt(card.value);
}


function calculateSum(cards) {
    let sum = 0;
    let numAces = 0;
    for (let card of cards) {
        if (card.value === "Туз") {
            numAces++;
            sum += 11;
        } else {
            sum += getCardValue(card);
        }
    }
 
    while (sum > 21 && numAces > 0) {
        sum -= 10;
        numAces--;
    }
    return sum;
}


function renderCards(cards, element, hideFirstCard = false) {
    element.innerHTML = "";
    cards.forEach((card, index) => {
        const cardEl = document.createElement("div");
        cardEl.classList.add("card");
        if (hideFirstCard && index === 0) {
            cardEl.classList.add("hidden-card");
            cardEl.textContent = "?";
        } else {
            cardEl.textContent = `${card.value[0]}${card.suit[0]}`; 
        }
        element.appendChild(cardEl);
    });
}


function dealCards() {
    dealerCards = [];
    playerCards = [];
    

    playerCards.push(deck.pop());
    dealerCards.push(deck.pop());
    playerCards.push(deck.pop());
    dealerCards.push(deck.pop());

    playerSum = calculateSum(playerCards);
    dealerSum = calculateSum(dealerCards);


    renderCards(playerCards, playerCardsEl);
    renderCards(dealerCards, dealerCardsEl, true);


    playerSumEl.textContent = playerSum;
    dealerSumEl.textContent = calculateSum([dealerCards[1]]); 
    resultEl.textContent = "";

    isGameActive = true;
    hitBtn.disabled = false;
    stayBtn.disabled = false;
}

function endGame(message) {
    isGameActive = false;
    hitBtn.disabled = true;
    stayBtn.disabled = true;


    renderCards(dealerCards, dealerCardsEl);
    dealerSumEl.textContent = dealerSum;

    resultEl.textContent = message;
}


hitBtn.addEventListener("click", () => {
    if (!isGameActive) return;

    playerCards.push(deck.pop());
    playerSum = calculateSum(playerCards);
    renderCards(playerCards, playerCardsEl);
    playerSumEl.textContent = playerSum;

    if (playerSum > 21) {
        endGame("Ви перебрали! Дилер переміг.");
    }
});


stayBtn.addEventListener("click", () => {
    if (!isGameActive) return;

   
    while (dealerSum < 17) {
        dealerCards.push(deck.pop());
        dealerSum = calculateSum(dealerCards);
    }

    if (dealerSum > 21) {
        endGame("Дилер перебрав! Ви перемогли!");
    } else if (playerSum > dealerSum) {
        endGame("Ви перемогли!");
    } else if (playerSum < dealerSum) {
        endGame("Дилер переміг!");
    } else {
        endGame("Нічия!");
    }
});


dealBtn.addEventListener("click", () => {
    createDeck();
    shuffleDeck();
    dealCards();
});


window.addEventListener("load", () => {
    createDeck();
    shuffleDeck();
    dealCards();
});