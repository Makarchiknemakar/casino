
const symbols = ["🏺", "🔮", "💎", "👑", "📜", "🗿", "🐞"]; 
const betAmount = 10;
const winMultiplier = 5;


const balanceEl = document.getElementById("balance-amount");
const reel1El = document.getElementById("reel-1");
const reel2El = document.getElementById("reel-2");
const reel3El = document.getElementById("reel-3");
const spinBtn = document.getElementById("spin-btn");
const resultMessageEl = document.getElementById("result-message");

let balance = 1000;
let isSpinning = false;


function updateBalance() {
    balanceEl.textContent = balance;
}


function spinReel(reelEl) {
    const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * symbols.length);
        reelEl.textContent = symbols[randomIndex];
    }, 50);
    return interval;
}


function stopReel(interval, reelEl) {
    clearInterval(interval);
    const randomIndex = Math.floor(Math.random() * symbols.length);
    const finalSymbol = symbols[randomIndex];
    reelEl.textContent = finalSymbol;
    return finalSymbol;
}


spinBtn.addEventListener("click", () => {
    if (isSpinning) return;
    if (balance < betAmount) {
        resultMessageEl.textContent = "Недостатньо коштів!";
        return;
    }

    isSpinning = true;
    balance -= betAmount;
    updateBalance();
    resultMessageEl.textContent = "Вам пощастить!";

    
    const spin1 = spinReel(reel1El);
    const spin2 = spinReel(reel2El);
    const spin3 = spinReel(reel3El);

 
    setTimeout(() => {
        const symbol1 = stopReel(spin1, reel1El);
        
        setTimeout(() => {
            const symbol2 = stopReel(spin2, reel2El);
            
            setTimeout(() => {
                const symbol3 = stopReel(spin3, reel3El);
                
                
                if (symbol1 === symbol2 && symbol2 === symbol3) {
                    const winnings = betAmount * winMultiplier;
                    balance += winnings;
                    resultMessageEl.textContent = `ВИГРАШ! +$${winnings}`;
                } else {
                    resultMessageEl.textContent = "Спробуйте ще раз!";
                }

                updateBalance();
                isSpinning = false;
            }, 1500);
        }, 1000);
    }, 500);
});


window.addEventListener("load", () => {
    updateBalance();
});