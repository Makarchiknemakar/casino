document.addEventListener('DOMContentLoaded', () => {
    const wheel = document.querySelector('.wheel');
    const numbersWrapper = document.querySelector('.numbers-wrapper');
    const numberGrid = document.querySelector('.number-grid');
    const betOptions = document.querySelector('.bet-options');
    const spinBtn = document.getElementById('spin-btn');
    const clearBetBtn = document.getElementById('clear-bet-btn');
    const balanceDisplay = document.getElementById('balance');
    const currentBetDisplay = document.getElementById('current-bet');
    const statusMessage = document.getElementById('status-message');
    const chips = document.querySelectorAll('.chip');

    let balance = 1000;
    let currentBetAmount = 1;
    let bets = {};

    const numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    const totalNumbers = numbers.length;
    const sectorAngle = 360 / totalNumbers;

    function updateBalance() {
        balanceDisplay.textContent = balance;
    }

    function updateCurrentBetDisplay() {
        const totalBet = Object.values(bets).reduce((sum, amount) => sum + amount, 0);
        currentBetDisplay.textContent = totalBet;
        spinBtn.disabled = totalBet === 0;
    }

    function createWheel() {
        let gradientString = 'conic-gradient(';
        let numbersHTML = '';

        numbers.forEach((number, index) => {
            const startAngle = index * sectorAngle;
            const endAngle = (index + 1) * sectorAngle;
            let color = 'var(--black)';
            if (number === 0) color = 'var(--green)';
            else if (redNumbers.includes(number)) color = 'var(--red)';

            if (index > 0) {
                gradientString += ', ';
            }
            gradientString += `${color} ${startAngle}deg ${endAngle}deg`;

            const rotation = (index * sectorAngle) + (sectorAngle / 2);
            numbersHTML += `<div class="number" style="transform: rotate(${rotation}deg) translateY(-170px) rotate(-${rotation}deg);">${number}</div>`;
        });
        
        gradientString += ')';
        wheel.style.backgroundImage = gradientString;
        numbersWrapper.innerHTML = numbersHTML;
    }

    function createGameBoard() {
        const createCell = (text, betType, betValue, isColor = false) => {
            const cell = document.createElement('div');
            cell.classList.add('bet-cell');
            cell.textContent = text;
            cell.dataset.betType = betType;
            cell.dataset.betValue = betValue;
            if (isColor) {
                if (text === '0') cell.classList.add('green');
                else if (redNumbers.includes(parseInt(text))) cell.classList.add('red');
                else cell.classList.add('black');
            }
            
            const betAmountSpan = document.createElement('span');
            betAmountSpan.classList.add('bet-amount');
            cell.appendChild(betAmountSpan);

            return cell;
        };
        
        const zeroCell = createCell('0', 'number', '0', true);
        numberGrid.appendChild(zeroCell);

        for (let i = 1; i <= 36; i++) {
            const cell = createCell(i.toString(), 'number', i.toString(), true);
            numberGrid.appendChild(cell);
        }
    }

    function handleBet(betKey, betValue) {
        if (balance < currentBetAmount) {
            statusMessage.textContent = 'Недостатньо коштів!';
            return;
        }

        const fullBetKey = `${betKey}-${betValue}`;
        if (!bets[fullBetKey]) {
            bets[fullBetKey] = 0;
        }
        bets[fullBetKey] += currentBetAmount;
        balance -= currentBetAmount;
        
        updateBalance();
        updateCurrentBetDisplay();

        const cell = document.querySelector(`[data-bet-type="${betKey}"][data-bet-value="${betValue}"]`);
        if (cell) {
            cell.classList.add('active');
            let amountSpan = cell.querySelector('.bet-amount');
            if (!amountSpan) {
                amountSpan = document.createElement('span');
                amountSpan.classList.add('bet-amount');
                cell.appendChild(amountSpan);
            }
            amountSpan.textContent = bets[fullBetKey];
        }

        statusMessage.textContent = `Ставка ${currentBetAmount}$ на ${betValue} зроблена!`;
    }

    function spinWheel() {
        spinBtn.disabled = true;
        clearBetBtn.disabled = true;
        statusMessage.textContent = 'Крутимо...';

        const winningNumberIndex = Math.floor(Math.random() * totalNumbers);
        const winningNumber = numbers[winningNumberIndex];
        const winningAngle = (360 * 10) + (180 - sectorAngle / 2) - (winningNumberIndex * sectorAngle);

      
        wheel.style.transform = `rotate(${winningAngle}deg)`;
        numbersWrapper.style.transform = `rotate(${winningAngle}deg)`;

        setTimeout(() => {
            checkWin(winningNumber);
            spinBtn.disabled = false;
            clearBetBtn.disabled = false;
            
            const currentRotation = (winningAngle) % 360;
            wheel.style.transition = 'none';
            numbersWrapper.style.transition = 'none';
            wheel.style.transform = `rotate(${currentRotation}deg)`;
            numbersWrapper.style.transform = `rotate(${currentRotation}deg)`;
        }, 5000);
    }
    
    function checkWin(winningNumber) {
        let winnings = 0;
        
        const winningNumberKey = `number-${winningNumber}`;
        if (bets[winningNumberKey]) {
            winnings += bets[winningNumberKey] * 35;
        }

        const winningColor = redNumbers.includes(winningNumber) ? 'red' : (winningNumber === 0 ? 'green' : 'black');
        const winningColorKey = `color-${winningColor}`;
        if (bets[winningColorKey]) {
            winnings += bets[winningColorKey] * 2;
        }

        if (winningNumber !== 0) {
            const winningParity = winningNumber % 2 === 0 ? 'even' : 'odd';
            const winningParityKey = `parity-${winningParity}`;
            if (bets[winningParityKey]) {
                winnings += bets[winningParityKey] * 2;
            }
        }

        if (winnings > 0) {
            balance += winnings;
            statusMessage.textContent = `Виграш! Випало число ${winningNumber}. Ваш виграш: ${winnings}$`;
        } else {
            statusMessage.textContent = `Випало число ${winningNumber}. Ви програли...`;
        }
        
        updateBalance();
        clearBets();
    }

    function clearBets() {
        bets = {};
        document.querySelectorAll('.bet-cell.active, .option.active').forEach(cell => {
            cell.classList.remove('active');
            const amountSpan = cell.querySelector('.bet-amount');
            if(amountSpan) amountSpan.textContent = '';
        });
        updateCurrentBetDisplay();
        statusMessage.textContent = 'Зробіть нову ставку.';
    }


    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentBetAmount = parseInt(chip.dataset.value);
            statusMessage.textContent = `Обрана ставка ${currentBetAmount}$`;
        });
    });

    [...numberGrid.children, ...betOptions.children].forEach(cell => {
        cell.addEventListener('click', () => {
            const betType = cell.dataset.betType;
            const betValue = cell.dataset.betValue;
            handleBet(betType, betValue);
        });
    });

    spinBtn.addEventListener('click', spinWheel);
    clearBetBtn.addEventListener('click', clearBets);

   
    createWheel();
    createGameBoard();
    updateBalance();
    updateCurrentBetDisplay();
});