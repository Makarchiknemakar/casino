
const dealBtn = document.getElementById('deal-btn');
const checkBtn = document.getElementById('check-btn');
const callBtn = document.getElementById('call-btn');
const raiseBtn = document.getElementById('raise-btn');
const foldBtn = document.getElementById('fold-btn');

const playerHandDiv = document.getElementById('player-hand');
const aiHandDiv = document.getElementById('ai-hand');
const communityCardsDiv = document.getElementById('community-cards');

const playerBankEl = document.getElementById('player-bank');
const aiBankEl = document.getElementById('ai-bank');
const playerBetEl = document.getElementById('player-bet');
const aiBetEl = document.getElementById('ai-bet');
const potEl = document.getElementById('pot');

const aiActionMessage = document.getElementById('ai-action');
const playerActionMessage = document.getElementById('player-action');


let deck = [];
let aiHand = [];
let playerHand = [];
let communityCards = [];
let playerBank = 1000;
let aiBank = 1000;
let pot = 0;
let currentBet = 0;
let playerBet = 0;
let aiBet = 0;
let gameStage = 'pre-flop';
let playersInRound = 2;
let currentPlayerTurn = 'player'; 


const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const suits = ['♠', '♥', '♦', '♣'];

function createDeck() {
    deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({ rank, suit });
        }
    }
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function createCardElement(card, isBack = false) {
    const cardDiv = document.createElement('div');
    if (isBack) {
        cardDiv.classList.add('card', 'back');
    } else {
        cardDiv.classList.add('card');
        const suitColor = (card.suit === '♥' || card.suit === '♦') ? 'red' : 'black';
        cardDiv.innerHTML = `
            <span class="card-suit top-left ${suitColor}">${card.suit}</span>
            <span>${card.rank}</span>
            <span class="card-suit bottom-right ${suitColor}">${card.suit}</span>
        `;
    }
    return cardDiv;
}

function updateUI() {
    playerBankEl.textContent = `Банк: $${playerBank}`;
    aiBankEl.textContent = `Банк: $${aiBank}`;
    potEl.textContent = `Банк: $${pot}`;
    playerBetEl.textContent = playerBet > 0 ? `Ставка: $${playerBet}` : '';
    aiBetEl.textContent = aiBet > 0 ? `Ставка: $${aiBet}` : '';
}

function clearTable() {
    playerHandDiv.innerHTML = '';
    aiHandDiv.innerHTML = '';
    communityCardsDiv.innerHTML = '';
    aiActionMessage.textContent = '';
    playerActionMessage.textContent = '';
    
    for (let i = 0; i < 2; i++) {
        const cardBack = document.createElement('div');
        cardBack.classList.add('card', 'empty');
        playerHandDiv.appendChild(cardBack);
        aiHandDiv.appendChild(cardBack.cloneNode());
    }
    for (let i = 0; i < 5; i++) {
        const cardEmpty = document.createElement('div');
        cardEmpty.classList.add('card', 'empty');
        communityCardsDiv.appendChild(cardEmpty);
    }
}

function enablePlayerControls(canCheck = false) {
    dealBtn.disabled = true;
    checkBtn.disabled = !canCheck;
    callBtn.disabled = currentBet <= playerBet;
    raiseBtn.disabled = false;
    foldBtn.disabled = false;
}

function disablePlayerControls() {
    dealBtn.disabled = true;
    checkBtn.disabled = true;
    callBtn.disabled = true;
    raiseBtn.disabled = true;
    foldBtn.disabled = true;
}

function evaluateHand(hand, community) {
    const allCards = [...hand, ...community];
    const ranksCount = {};
    const suitsCount = {};
    
    allCards.forEach(card => {
        ranksCount[card.rank] = (ranksCount[card.rank] || 0) + 1;
        suitsCount[card.suit] = (suitsCount[card.suit] || 0) + 1;
    });

    const isFlush = Object.values(suitsCount).some(count => count >= 2);
    const pairs = Object.values(ranksCount).filter(count => count === 2).length;
    const trips = Object.values(ranksCount).filter(count => count === 3).length;

    if (isFlush) return { rank: 5, message: 'Флеш' };
    if (trips > 0) return { rank: 4, message: 'Сет' };
    if (pairs === 2) return { rank: 3, message: 'Дві пари' };
    if (pairs === 1) return { rank: 2, message: 'Пара' };
    
    const highCardValue = Math.max(...allCards.map(c => ranks.indexOf(c.rank)));
    return { rank: 1, highCard: highCardValue, message: 'Старша карта' };
}

function determineWinner() {
    aiHandDiv.innerHTML = '';
    aiHand.forEach(card => aiHandDiv.appendChild(createCardElement(card)));

    const playerEval = evaluateHand(playerHand, communityCards);
    const aiEval = evaluateHand(aiHand, communityCards);

    let winnerMessage = '';
    if (playerEval.rank > aiEval.rank) {
        winnerMessage = `Ви виграли! (${playerEval.message})`;
        playerBank += pot;
    } else if (aiEval.rank > playerEval.rank) {
        winnerMessage = `Комп'ютер виграв! (${aiEval.message})`;
        aiBank += pot;
    } else {
        winnerMessage = `Нічия! (${playerEval.message})`;
        playerBank += pot / 2;
        aiBank += pot / 2;
    }

    const winnerDiv = document.createElement('div');
    winnerDiv.classList.add('winner-message');
    winnerDiv.textContent = winnerMessage;
    document.body.appendChild(winnerDiv);

    setTimeout(() => {
        document.body.removeChild(winnerDiv);
        dealBtn.disabled = false;
        pot = 0;
        playerBet = 0;
        aiBet = 0;
        currentBet = 0;
        updateUI();
        clearTable();
    }, 4000);
}


function advanceGameStage() {
    
    if (playersInRound > 1) {
        if (playerBet === currentBet && aiBet === currentBet) {
            
        } else {
    
            return;
        }
    }
    

    pot += playerBet + aiBet;
    playerBet = 0;
    aiBet = 0;
    currentBet = 0;
    updateUI();
    
    switch (gameStage) {
        case 'pre-flop':
            communityCards.push(deck.pop(), deck.pop(), deck.pop());
            communityCards.forEach((card, index) => {
                communityCardsDiv.children[index].replaceWith(createCardElement(card));
            });
            gameStage = 'flop';
            break;
        case 'flop':
            communityCards.push(deck.pop());
            communityCardsDiv.children[3].replaceWith(createCardElement(communityCards[3]));
            gameStage = 'turn';
            break;
        case 'turn':
            communityCards.push(deck.pop());
            communityCardsDiv.children[4].replaceWith(createCardElement(communityCards[4]));
            gameStage = 'river';
            break;
        case 'river':
            determineWinner();
            return;
    }
    
 
    currentPlayerTurn = 'ai';
    aiTurn();
}

function aiTurn() {
    disablePlayerControls();
    
    const handStrength = evaluateHand(aiHand, communityCards);
    let action = '';

    if (currentBet === 0) {
        action = 'Чек.';
    } else if (handStrength.rank > 2) {
        action = 'Рейз!';
        const raiseAmount = 10;
        const betAmount = currentBet + raiseAmount - aiBet;
        aiBet += betAmount;
        aiBank -= betAmount;
        currentBet = aiBet;
    } else if (currentBet <= aiBet) {
        action = 'Кол.';
        const betAmount = currentBet - aiBet;
        aiBet += betAmount;
        aiBank -= betAmount;
    } else {
        action = 'Фолд.';
        playersInRound = 1;
    }

    aiActionMessage.textContent = `Комп'ютер каже: ${action}`;
    updateUI();

    setTimeout(() => {
        aiActionMessage.textContent = '';
        if (action === 'Фолд.') {
            const winnerDiv = document.createElement('div');
            winnerDiv.classList.add('winner-message');
            winnerDiv.textContent = 'Комп\'ютер скинув карти. Ви виграли!';
            document.body.appendChild(winnerDiv);
            playerBank += pot;
            setTimeout(() => {
                document.body.removeChild(winnerDiv);
                dealBtn.disabled = false;
                pot = 0;
                playerBet = 0;
                aiBet = 0;
                currentBet = 0;
                updateUI();
                clearTable();
            }, 3000);
        } else {
            currentPlayerTurn = 'player';
            enablePlayerControls(currentBet === playerBet);
        }
    }, 1500);
}


dealBtn.addEventListener('click', () => {
    gameStage = 'pre-flop';
    pot = 0;
    playerBet = 0;
    aiBet = 0;
    currentBet = 0;
    communityCards = [];
    playersInRound = 2;
    updateUI();
    clearTable();

    createDeck();

    playerHand = [deck.pop(), deck.pop()];
    aiHand = [deck.pop(), deck.pop()];

    playerHandDiv.innerHTML = '';
    playerHand.forEach(card => playerHandDiv.appendChild(createCardElement(card)));

    aiHandDiv.innerHTML = '';
    aiHand.forEach(() => aiHandDiv.appendChild(createCardElement(null, true)));
    
    currentPlayerTurn = 'ai';
    aiTurn();
});

checkBtn.addEventListener('click', () => {
    playerActionMessage.textContent = 'Ви зробили: Чек.';
    disablePlayerControls();
    setTimeout(() => {
        playerActionMessage.textContent = '';
        currentPlayerTurn = 'ai';
        if (playerBet === currentBet && aiBet === currentBet) {
            advanceGameStage();
        } else {
            aiTurn();
        }
    }, 1000);
});

callBtn.addEventListener('click', () => {
    const betAmount = currentBet - playerBet;
    if (betAmount > playerBank) return;
    
    playerBet += betAmount;
    playerBank -= betAmount;
    
    playerActionMessage.textContent = `Ви зробили: Кол ($${betAmount}).`;
    updateUI();
    disablePlayerControls();
    
    setTimeout(() => {
        playerActionMessage.textContent = '';
        currentPlayerTurn = 'ai';
        if (playerBet === currentBet && aiBet === currentBet) {
            advanceGameStage();
        } else {
            aiTurn();
        }
    }, 1000);
});

raiseBtn.addEventListener('click', () => {
    const raiseAmount = 20;
    const betAmount = currentBet + raiseAmount - playerBet;
    if (betAmount > playerBank) return;

    playerBet += betAmount;
    playerBank -= betAmount;
    currentBet = playerBet;

    playerActionMessage.textContent = `Ви зробили: Рейз ($${betAmount}).`;
    updateUI();
    disablePlayerControls();

    setTimeout(() => {
        playerActionMessage.textContent = '';
        currentPlayerTurn = 'ai';
        aiTurn();
    }, 1000);
});

foldBtn.addEventListener('click', () => {
    playerActionMessage.textContent = 'Ви скинули карти.';
    disablePlayerControls();
    
    const winnerDiv = document.createElement('div');
    winnerDiv.classList.add('winner-message');
    winnerDiv.textContent = 'Ви скинули карти. Комп\'ютер виграв!';
    document.body.appendChild(winnerDiv);
    aiBank += pot + playerBet + aiBet;

    setTimeout(() => {
        document.body.removeChild(winnerDiv);
        dealBtn.disabled = false;
        pot = 0;
        playerBet = 0;
        aiBet = 0;
        currentBet = 0;
        updateUI();
        clearTable();
    }, 3000);
});


clearTable();
updateUI();
dealBtn.disabled = false;