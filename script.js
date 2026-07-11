let board = [" ", " ", " ", " ", " ", " ", " ", " ", " "];
let playerScore = 0;
let aiScore = 0;
let drawScore = 0;
let isGameOver = false;
let gameMode = "AI"; 

const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');
const clearScoreBtn = document.getElementById('clear-score-btn');
const backMenuBtn = document.getElementById('back-to-menu-btn');
const globalThemeBtn = document.getElementById('global-theme-btn');

// Menu UI Hooks
const centerStartBtn = document.getElementById('center-start-btn');
const pvpBtn = document.getElementById('pvp-btn');
const pvaBtn = document.getElementById('pva-btn');
const instBtn = document.getElementById('instructions-btn');
const welcomeScreen = document.getElementById('welcome-screen');
const gameContent = document.getElementById('game-content');
const opponentHeader = document.getElementById('opponent-header');

// Global Theme Switcher
globalThemeBtn.onclick = () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    globalThemeBtn.textContent = isLight ? "🌙 DARK" : "☀️ LIGHT";
};

// Mode selections
pvpBtn.onclick = () => {
    gameMode = "Player";
    pvpBtn.classList.add('active');
    pvaBtn.classList.remove('active');
};

pvaBtn.onclick = () => {
    gameMode = "AI";
    pvaBtn.classList.add('active');
    pvpBtn.classList.remove('active');
};

instBtn.onclick = () => {
    alert("Instructions:\n1. Choose 'Play vs Player' or 'Play vs AI'.\n2. Click 'START' inside the central board preview frame to initiate.\n3. Match 3 markers horizontally, vertically, or diagonally to win!");
};

function launchGame() {
    opponentHeader.textContent = gameMode === "AI" ? "🤖 AI" : "👥 Player 2";
    opponentHeader.parentElement.className = `capsule ${gameMode === "AI" ? 'ai' : 'player'}`;
    
    welcomeScreen.style.opacity = '0';
    welcomeScreen.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        welcomeScreen.classList.add('hidden');
        gameContent.classList.remove('hidden');
        resetRound();
    }, 400);
}

centerStartBtn.onclick = launchGame;

function initBoard() {
    cells.forEach((cell, i) => {
        cell.textContent = "";
        cell.className = "cell";
        cell.onclick = () => handleCellClick(i);
    });
}

function handleCellClick(index) {
    if (board[index] !== " " || isGameOver) return;

    let currentTurn = board.filter(c => c !== " ").length % 2 === 0 ? "O" : "X";
    makeMove(index, currentTurn);
    
    if (checkGameStatus()) return;

    if (gameMode === "AI") {
        statusDisplay.textContent = "AI PROCESSING...";
        setTimeout(aiTurn, 300);
    } else {
        let nextTurn = currentTurn === "O" ? "X" : "O";
        statusDisplay.textContent = `PLAYER ${nextTurn} TURN`;
    }
}

function makeMove(index, player) {
    board[index] = player;
    cells[index].textContent = player === "O" ? "●" : "✕";
    cells[index].className = `cell ${player === "O" ? "cell-o" : "cell-x"}`;
}

function aiTurn() {
    let move = getBestMove();
    if (move !== -1) {
        makeMove(move, "X");
    }
    checkGameStatus();
}

function checkWinner(currentBoard) {
    const wins = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
    for (let combo of wins) {
        if (currentBoard[combo[0]] === currentBoard[combo[1]] && currentBoard[combo[1]] === currentBoard[combo[2]] && currentBoard[combo[0]] !== " ") {
            return { winner: currentBoard[combo[0]], combo };
        }
    }
    if (!currentBoard.includes(" ")) return { winner: "Draw", combo: null };
    return null;
}

function checkGameStatus() {
    let result = checkWinner(board);
    if (!result) return false;

    isGameOver = true;
    if (result.winner === "Draw") {
        drawScore++;
        statusDisplay.textContent = "DRAW GAME!";
    } else if (result.winner === "O") {
        playerScore++;
        statusDisplay.textContent = gameMode === "AI" ? "VICTORY SIGNED!" : "PLAYER O WINS!";
    } else {
        aiScore++;
        statusDisplay.textContent = gameMode === "AI" ? "AI WON THE ROUND!" : "PLAYER X WINS!";
    }
    
    updateScoreboardDisplay();

    if (result.combo) {
        result.combo.forEach(i => cells[i].classList.add('win-highlight'));
    }
    return true;
}

function evaluate(depth) {
    let result = checkWinner(board);
    if (result && result.winner === "X") return 10 - depth;
    if (result && result.winner === "O") return depth - 10;
    return 0;
}

function minimax(isMax, alpha, beta, depth) {
    let score = evaluate(depth);
    let result = checkWinner(board);
    if (score !== 0 || (result && result.winner === "Draw")) return score;

    const preferredMoves = [4, 0, 2, 6, 8, 1, 3, 5, 7];

    if (isMax) {
        let best = -Infinity;
        for (let move of preferredMoves) {
            if (board[move] === " ") {
                board[move] = "X";
                best = Math.max(best, minimax(false, alpha, beta, depth + 1));
                board[move] = " ";
                alpha = Math.max(alpha, best);
                if (beta <= alpha) break;
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let move of preferredMoves) {
            if (board[move] === " ") {
                board[move] = "O";
                best = Math.min(best, minimax(true, alpha, beta, depth + 1));
                board[move] = " ";
                beta = Math.min(beta, best);
                if (beta <= alpha) break;
            }
        }
        return best;
    }
}

function getBestMove() {
    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < 9; i++) {
        if (board[i] === " ") {
            board[i] = "X";
            let score = minimax(false, -Infinity, Infinity, 0);
            board[i] = " ";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function updateScoreboardDisplay() {
    document.getElementById('player-score').textContent = playerScore;
    document.getElementById('ai-score').textContent = aiScore;
    document.getElementById('draws-score').textContent = drawScore;
}

function resetRound() {
    board = [" ", " ", " ", " ", " ", " ", " ", " ", " "];
    isGameOver = false;
    statusDisplay.textContent = "YOUR TURN (O)";
    initBoard();
}

function resetFullScoreboard() {
    playerScore = 0;
    aiScore = 0;
    drawScore = 0;
    updateScoreboardDisplay();
    resetRound();
}

resetBtn.onclick = resetRound;
clearScoreBtn.onclick = resetFullScoreboard;

backMenuBtn.onclick = () => {
    gameContent.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    welcomeScreen.style.opacity = '1';
    welcomeScreen.style.transform = 'scale(1)';
};

pvaBtn.classList.add('active');
initBoard();