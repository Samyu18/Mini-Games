// Global variables
let currentGame = null;
let gameState = {};
let gameMode = null; // 'single' or 'multiplayer'
let currentUser = null;
let gameStartTime = null;
let snakeGameLoop = null; // For snake game interval

// Authentication functions
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/check-auth');
        const data = await response.json();
        
        if (data.authenticated) {
            currentUser = data.user;
            showMainSection();
        } else {
            showAuthSection();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        showAuthSection();
    }
}

function showAuthSection() {
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('main-section').classList.add('hidden');
}

function showMainSection() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('main-section').classList.remove('hidden');
    document.getElementById('user-username').textContent = `Welcome, ${currentUser.username}!`;
}

// Auth form functions
function showLogin() {
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('login-form-content').classList.remove('hidden');
    document.getElementById('register-form-content').classList.add('hidden');
}

function showRegister() {
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('register-form-content').classList.remove('hidden');
    document.getElementById('login-form-content').classList.add('hidden');
}

// Form event listeners
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    
    // Login form
    document.getElementById('login-form-content').addEventListener('submit', async function(e) {
        e.preventDefault();
        await login();
    });
    
    // Register form
    document.getElementById('register-form-content').addEventListener('submit', async function(e) {
        e.preventDefault();
        await register();
    });
});

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = { username, id: data.user_id };
            showMainSection();
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

async function register() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Registration successful! Please login.');
            showLogin();
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
}

async function logout() {
    try {
        await fetch('/api/logout');
        currentUser = null;
        showAuthSection();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Stats and Leaderboard functions
async function showStats() {
    try {
        const response = await fetch('/api/user-stats');
        const stats = await response.json();
        
        const statsContent = document.getElementById('stats-content');
        statsContent.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Rock Paper Scissors</h3>
                    <div class="stat-value">${stats.rps.score}</div>
                    <p>Wins: ${stats.rps.wins} | Losses: ${stats.rps.losses} | Draws: ${stats.rps.draws}</p>
                </div>
                <div class="stat-card">
                    <h3>Tic Tac Toe</h3>
                    <div class="stat-value">${stats.ttt.score}</div>
                    <p>Wins: ${stats.ttt.wins} | Losses: ${stats.ttt.losses} | Draws: ${stats.ttt.draws}</p>
                </div>
                <div class="stat-card">
                    <h3>Memory Game</h3>
                    <div class="stat-value">${stats.memory.score}</div>
                    <p>Wins: ${stats.memory.wins} | Losses: ${stats.memory.losses} | Draws: ${stats.memory.draws}</p>
                </div>
                <div class="stat-card">
                    <h3>Snake Game</h3>
                    <div class="stat-value">${stats.snake.score}</div>
                    <p>Wins: ${stats.snake.wins} | Losses: ${stats.snake.losses} | Draws: ${stats.snake.draws}</p>
                </div>
            </div>
        `;
        
        document.getElementById('stats-modal').classList.remove('hidden');
    } catch (error) {
        console.error('Error loading stats:', error);
        alert('Failed to load statistics');
    }
}

async function showLeaderboards() {
    document.getElementById('leaderboard-modal').classList.remove('hidden');
    await showLeaderboard('rps');
}

async function showLeaderboard(gameType) {
    // Update active tab
    document.querySelectorAll('.leaderboard-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    try {
        const response = await fetch(`/api/leaderboard/${gameType}`);
        const leaderboard = await response.json();
        
        const gameNames = {
            'rps': 'Rock Paper Scissors',
            'ttt': 'Tic Tac Toe',
            'memory': 'Memory Game'
        };
        
        const leaderboardContent = document.getElementById('leaderboard-content');
        leaderboardContent.innerHTML = `
            <h3>${gameNames[gameType]} Leaderboard</h3>
            <table class="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Score</th>
                        <th>Wins</th>
                        <th>Losses</th>
                        <th>Draws</th>
                    </tr>
                </thead>
                <tbody>
                    ${leaderboard.map((entry, index) => `
                        <tr>
                            <td class="rank">#${index + 1}</td>
                            <td class="username">${entry.username}</td>
                            <td class="score">${entry.score}</td>
                            <td>${entry.wins}</td>
                            <td>${entry.losses}</td>
                            <td>${entry.draws}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        alert('Failed to load leaderboard');
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Game saving function
async function saveGameResult(gameType, gameMode, player1Score, player2Score, winner) {
    if (!currentUser) return;
    
    const duration = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0;
    
    try {
        await fetch('/api/save-game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                game_type: gameType,
                game_mode: gameMode,
                player1_score: player1Score,
                player2_score: player2Score,
                winner: winner,
                duration: duration
            })
        });
    } catch (error) {
        console.error('Error saving game:', error);
    }
}

// Navigation functions
function loadGame(gameType) {
    currentGame = gameType;
    gameStartTime = Date.now();
    document.querySelector('.games-grid').style.display = 'none';
    document.getElementById('game-container').classList.remove('hidden');
    
    // Show player selection first
    showPlayerSelection(gameType);
}

function showPlayerSelection(gameType) {
    const gameHTML = `
        <h2 class="game-title">🎮 Select Game Mode</h2>
        <div class="player-select">
            <div class="player-option" onclick="selectGameMode('${gameType}', 'single')">
                <div style="font-size: 2rem; margin-bottom: 10px;">🤖</div>
                <h3>Play vs Computer</h3>
                <p>Challenge the AI</p>
            </div>
            <div class="player-option" onclick="selectGameMode('${gameType}', 'multiplayer')">
                <div style="font-size: 2rem; margin-bottom: 10px;">👥</div>
                <h3>2 Players</h3>
                <p>Play with a friend</p>
            </div>
        </div>
    `;
    
    document.getElementById('game-content').innerHTML = gameHTML;
}

function selectGameMode(gameType, mode) {
    gameMode = mode;
    
    switch(gameType) {
        case 'rock-paper-scissors':
            loadRockPaperScissors();
            break;
        case 'tic-tac-toe':
            loadTicTacToe();
            break;
        case 'memory':
            loadMemoryGame();
            break;
        case 'snake':
            loadSnakeGame();
            break;
    }
}

function showMainMenu() {
    currentGame = null;
    gameState = {};
    gameMode = null;
    gameStartTime = null;
    document.querySelector('.games-grid').style.display = 'grid';
    document.getElementById('game-container').classList.add('hidden');
    document.getElementById('game-content').innerHTML = '';
}

// Rock Paper Scissors Game
function loadRockPaperScissors() {
    gameState = {
        player1Score: 0,
        player2Score: 0,
        choices: ['rock', 'paper', 'scissors'],
        currentPlayer: 1,
        player1Choice: null,
        player2Choice: null,
        round: 1,
        countdown: 3,
        canPlay: false
    };
    
    const modeText = gameMode === 'single' ? 'vs Computer' : 'vs Player 2';
    
    const gameHTML = `
        <h2 class="game-title">✂️ Rock Paper Scissors</h2>
        <div class="score-board">
            <div>Player 1: <span id="player1-score">0</span></div>
            <div>${gameMode === 'single' ? 'Computer' : 'Player 2'}: <span id="player2-score">0</span></div>
        </div>
        <div class="game-area">
            <div id="rps-countdown" class="rps-countdown"></div>
            <div class="rps-hands">
                <div id="hand-player1" class="rps-hand rps-hand-shake">✊</div>
                <div id="hand-player2" class="rps-hand rps-hand-shake">✊</div>
            </div>
            <p id="current-player-text">Player 1's turn - Choose your weapon:</p>
            <button class="btn" onclick="playRPS('rock')">🪨 Rock</button>
            <button class="btn" onclick="playRPS('paper')">📄 Paper</button>
            <button class="btn" onclick="playRPS('scissors')">✂️ Scissors</button>
        </div>
        <div id="rps-result" class="result" style="display: none;"></div>
        <div class="game-area">
            <button class="btn" onclick="resetRPS()">New Game</button>
        </div>
    `;
    
    document.getElementById('game-content').innerHTML = gameHTML;
    startRPSCountdown();
}

function startRPSCountdown() {
    gameState.countdown = 3;
    gameState.canPlay = false;
    updateRPSCountdown();
    const countdownInterval = setInterval(() => {
        gameState.countdown--;
        updateRPSCountdown();
        if (gameState.countdown === 0) {
            clearInterval(countdownInterval);
            document.getElementById('rps-countdown').textContent = 'Go!';
            setTimeout(() => {
                document.getElementById('rps-countdown').textContent = '';
                gameState.canPlay = true;
                animateRPSHands('reset');
            }, 500);
        }
    }, 800);
    animateRPSHands('shake');
}

function updateRPSCountdown() {
    document.getElementById('rps-countdown').textContent = gameState.countdown > 0 ? gameState.countdown : '';
    animateRPSHands('shake');
}

function animateRPSHands(state) {
    const hand1 = document.getElementById('hand-player1');
    const hand2 = document.getElementById('hand-player2');
    if (!hand1 || !hand2) return;
    if (state === 'shake') {
        hand1.className = 'rps-hand rps-hand-shake';
        hand2.className = 'rps-hand rps-hand-shake';
        hand1.textContent = '✊';
        hand2.textContent = '✊';
    } else if (state === 'reset') {
        hand1.className = 'rps-hand';
        hand2.className = 'rps-hand';
        hand1.textContent = '✊';
        hand2.textContent = '✊';
    }
}

function playRPS(choice) {
    if (!gameState.canPlay) return;
    if (gameState.currentPlayer === 1) {
        gameState.player1Choice = choice;
        showRPSHand('hand-player1', choice);
        if (gameMode === 'single') {
            // Computer makes choice
            setTimeout(() => {
                gameState.player2Choice = gameState.choices[Math.floor(Math.random() * 3)];
                showRPSHand('hand-player2', gameState.player2Choice);
                setTimeout(determineRPSWinner, 700);
            }, 700);
        } else {
            // Switch to player 2
            gameState.currentPlayer = 2;
            document.getElementById('current-player-text').textContent = "Player 2's turn - Choose your weapon:";
            gameState.canPlay = false;
            setTimeout(() => {
                startRPSCountdown();
            }, 700);
        }
    } else {
        gameState.player2Choice = choice;
        showRPSHand('hand-player2', choice);
        setTimeout(determineRPSWinner, 700);
    }
}

function showRPSHand(handId, choice) {
    const hand = document.getElementById(handId);
    const emoji = choice === 'rock' ? '✊' : choice === 'paper' ? '🖐️' : '✌️';
    hand.textContent = emoji;
    hand.className = 'rps-hand rps-hand-reveal';
}

function determineRPSWinner() {
    const result = determineWinner(gameState.player1Choice, gameState.player2Choice);
    // Update scores
    if (result === 'win') {
        gameState.player1Score++;
    } else if (result === 'lose') {
        gameState.player2Score++;
    }
    document.getElementById('player1-score').textContent = gameState.player1Score;
    document.getElementById('player2-score').textContent = gameState.player2Score;
    // Show result
    const resultDiv = document.getElementById('rps-result');
    resultDiv.style.display = 'block';
    resultDiv.className = `result ${result}`;
    const choiceEmojis = {
        'rock': '🪨',
        'paper': '📄',
        'scissors': '✂️'
    };
    const player2Name = gameMode === 'single' ? 'Computer' : 'Player 2';
    const resultMessages = {
        'win': `Player 1 wins! ${choiceEmojis[gameState.player1Choice]} beats ${choiceEmojis[gameState.player2Choice]}`,
        'lose': `${player2Name} wins! ${choiceEmojis[gameState.player2Choice]} beats ${choiceEmojis[gameState.player1Choice]}`,
        'draw': `It's a draw! Both chose ${choiceEmojis[gameState.player1Choice]}`
    };
    resultDiv.textContent = resultMessages[result];
    // Save game result
    const winner = result === 'win' ? 'player1' : result === 'lose' ? 'player2' : 'draw';
    saveGameResult('rps', gameMode, gameState.player1Score, gameState.player2Score, winner);
    // Reset for next round
    setTimeout(() => {
        gameState.currentPlayer = 1;
        gameState.player1Choice = null;
        gameState.player2Choice = null;
        gameState.round++;
        document.getElementById('current-player-text').textContent = "Player 1's turn - Choose your weapon:";
        resultDiv.style.display = 'none';
        animateRPSHands('reset');
        startRPSCountdown();
    }, 2000);
}

function resetRPS() {
    gameState = {
        player1Score: 0,
        player2Score: 0,
        choices: ['rock', 'paper', 'scissors'],
        currentPlayer: 1,
        player1Choice: null,
        player2Choice: null,
        round: 1
    };
    document.getElementById('player1-score').textContent = '0';
    document.getElementById('player2-score').textContent = '0';
    document.getElementById('current-player-text').textContent = "Player 1's turn - Choose your weapon:";
    document.getElementById('rps-result').style.display = 'none';
}

function determineWinner(player, computer) {
    if (player === computer) return 'draw';
    if (
        (player === 'rock' && computer === 'scissors') ||
        (player === 'paper' && computer === 'rock') ||
        (player === 'scissors' && computer === 'paper')
    ) {
        return 'win';
    }
    return 'lose';
}

// Tic Tac Toe Game
function loadTicTacToe() {
    gameState = {
        board: Array(9).fill(''),
        currentPlayer: 'X',
        gameActive: true,
        player1Score: 0,
        player2Score: 0,
        draws: 0
    };
    
    const gameHTML = `
        <h2 class="game-title">⭕ Tic Tac Toe</h2>
        <div class="score-board">
            <div>Player X: <span id="player-x-score">0</span></div>
            <div>Player O: <span id="player-o-score">0</span></div>
            <div>Draws: <span id="draws-score">0</span></div>
        </div>
        <div class="game-area">
            <p>Current Player: <span id="current-player" style="color: #ff6b6b; font-weight: bold;">X</span></p>
            <div class="ttt-board" id="ttt-board"></div>
        </div>
        <div id="ttt-result" class="result" style="display: none;"></div>
        <div class="game-area">
            <button class="btn" onclick="resetTicTacToe()">New Game</button>
        </div>
    `;
    
    document.getElementById('game-content').innerHTML = gameHTML;
    renderTicTacToeBoard();
}

function renderTicTacToeBoard() {
    const board = document.getElementById('ttt-board');
    board.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'ttt-cell';
        cell.textContent = gameState.board[i];
        if (gameState.board[i] === 'X') cell.classList.add('x');
        if (gameState.board[i] === 'O') cell.classList.add('o');
        cell.onclick = () => makeMove(i);
        board.appendChild(cell);
    }
}

function makeMove(index) {
    if (gameState.board[index] !== '' || !gameState.gameActive) return;
    
    // Player move
    gameState.board[index] = gameState.currentPlayer;
    renderTicTacToeBoard();
    
    if (checkWinner()) {
        gameState.gameActive = false;
        if (gameState.currentPlayer === 'X') {
            gameState.player1Score++;
            document.getElementById('player-x-score').textContent = gameState.player1Score;
        } else {
            gameState.player2Score++;
            document.getElementById('player-o-score').textContent = gameState.player2Score;
        }
        
        const winner = gameState.currentPlayer === 'X' ? 'player1' : 'player2';
        saveGameResult('ttt', gameMode, gameState.player1Score, gameState.player2Score, winner);
        
        showTicTacToeResult(`${gameState.currentPlayer} wins!`);
        return;
    }
    
    if (gameState.board.every(cell => cell !== '')) {
        gameState.gameActive = false;
        gameState.draws++;
        document.getElementById('draws-score').textContent = gameState.draws;
        
        saveGameResult('ttt', gameMode, gameState.player1Score, gameState.player2Score, 'draw');
        
        showTicTacToeResult("It's a draw!");
        return;
    }
    
    // Switch players
    gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
    const currentPlayerSpan = document.getElementById('current-player');
    currentPlayerSpan.textContent = gameState.currentPlayer;
    currentPlayerSpan.style.color = gameState.currentPlayer === 'X' ? '#ff6b6b' : '#4ecdc4';
    
    // Computer move in single player mode
    if (gameMode === 'single' && gameState.currentPlayer === 'O') {
        setTimeout(() => {
            const computerMove = getComputerMove();
            if (computerMove !== -1) {
                makeMove(computerMove);
            }
        }, 500);
    }
}

function getComputerMove() {
    const availableMoves = gameState.board
        .map((cell, index) => cell === '' ? index : -1)
        .filter(index => index !== -1);
    
    if (availableMoves.length === 0) return -1;
    
    // Try to win
    for (let move of availableMoves) {
        const testBoard = [...gameState.board];
        testBoard[move] = 'O';
        if (checkWinnerForBoard(testBoard, 'O')) {
            return move;
        }
    }
    
    // Block player from winning
    for (let move of availableMoves) {
        const testBoard = [...gameState.board];
        testBoard[move] = 'X';
        if (checkWinnerForBoard(testBoard, 'X')) {
            return move;
        }
    }
    
    // Take center if available
    if (availableMoves.includes(4)) {
        return 4;
    }
    
    // Take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(corner => availableMoves.includes(corner));
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // Take any available move
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function checkWinnerForBoard(board, player) {
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    return winConditions.some(condition => {
        const [a, b, c] = condition;
        return board[a] === player && 
               board[a] === board[b] && 
               board[a] === board[c];
    });
}

function checkWinner() {
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    return winConditions.some(condition => {
        const [a, b, c] = condition;
        return gameState.board[a] && 
               gameState.board[a] === gameState.board[b] && 
               gameState.board[a] === gameState.board[c];
    });
}

function showTicTacToeResult(message) {
    const resultDiv = document.getElementById('ttt-result');
    resultDiv.style.display = 'block';
    resultDiv.textContent = message;
    resultDiv.className = message.includes('wins') ? 'result win' : 'result draw';
}

function resetTicTacToe() {
    gameState = {
        board: Array(9).fill(''),
        currentPlayer: 'X',
        gameActive: true,
        player1Score: gameState.player1Score,
        player2Score: gameState.player2Score,
        draws: gameState.draws
    };
    document.getElementById('current-player').textContent = 'X';
    document.getElementById('current-player').style.color = '#ff6b6b';
    document.getElementById('ttt-result').style.display = 'none';
    renderTicTacToeBoard();
}

// Memory Game
function loadMemoryGame() {
    const symbols = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎪', '🎨'];
    gameState = {
        cards: [...symbols, ...symbols].sort(() => Math.random() - 0.5),
        flipped: [],
        matched: [],
        canFlip: true,
        player1Score: 0,
        player2Score: 0,
        currentPlayer: 1,
        moves: 0
    };
    
    const player2Name = gameMode === 'single' ? 'Computer' : 'Player 2';
    
    const gameHTML = `
        <h2 class="game-title">🧠 Memory Game</h2>
        <div class="score-board">
            <div>Player 1: <span id="player1-matches">0</span></div>
            <div>${player2Name}: <span id="player2-matches">0</span></div>
            <div>Moves: <span id="moves">0</span></div>
        </div>
        <div class="game-area">
            <p>Current Player: <span id="current-memory-player" style="color: #ff6b6b; font-weight: bold;">Player 1</span></p>
            <div class="memory-grid" id="memory-grid"></div>
        </div>
        <div id="memory-result" class="result" style="display: none;"></div>
        <div class="game-area">
            <button class="btn" onclick="resetMemoryGame()">New Game</button>
        </div>
    `;
    
    document.getElementById('game-content').innerHTML = gameHTML;
    renderMemoryBoard();
}

function renderMemoryBoard() {
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';
    
    gameState.cards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        
        const isFlipped = gameState.flipped.includes(index) || gameState.matched.includes(index);
        const isMatched = gameState.matched.includes(index);
        
        if (isFlipped) {
            card.classList.add('flipped');
            card.textContent = symbol;
        }
        
        if (isMatched) {
            card.classList.add('matched');
        }
        
        card.onclick = () => flipCard(index);
        grid.appendChild(card);
    });
}

function flipCard(index) {
    if (!gameState.canFlip || 
        gameState.flipped.includes(index) || 
        gameState.matched.includes(index)) {
        return;
    }
    
    gameState.flipped.push(index);
    gameState.moves++;
    document.getElementById('moves').textContent = gameState.moves;
    renderMemoryBoard();
    
    if (gameState.flipped.length === 2) {
        gameState.canFlip = false;
        
        setTimeout(() => {
            const [first, second] = gameState.flipped;
            
            if (gameState.cards[first] === gameState.cards[second]) {
                gameState.matched.push(first, second);
                
                // Award point to current player
                if (gameState.currentPlayer === 1) {
                    gameState.player1Score++;
                    document.getElementById('player1-matches').textContent = gameState.player1Score;
                } else {
                    gameState.player2Score++;
                    document.getElementById('player2-matches').textContent = gameState.player2Score;
                }
                
                if (gameState.matched.length === gameState.cards.length) {
                    const player2Name = gameMode === 'single' ? 'Computer' : 'Player 2';
                    const winner = gameState.player1Score > gameState.player2Score ? 'Player 1' : 
                                 gameState.player2Score > gameState.player1Score ? player2Name : 'Tie';
                    showMemoryResult(`Game Over! ${winner} wins!`);
                    
                    // Save game result
                    const winnerType = gameState.player1Score > gameState.player2Score ? 'player1' : 
                                     gameState.player2Score > gameState.player1Score ? 'player2' : 'draw';
                    saveGameResult('memory', gameMode, gameState.player1Score, gameState.player2Score, winnerType);
                }
            } else {
                // Switch players if no match
                gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
                const currentPlayerSpan = document.getElementById('current-memory-player');
                const player2Name = gameMode === 'single' ? 'Computer' : 'Player 2';
                currentPlayerSpan.textContent = gameState.currentPlayer === 1 ? 'Player 1' : player2Name;
                currentPlayerSpan.style.color = gameState.currentPlayer === 1 ? '#ff6b6b' : '#4ecdc4';
            }
            
            gameState.flipped = [];
            gameState.canFlip = true;
            renderMemoryBoard();
            
            // Computer move in single player mode
            if (gameMode === 'single' && gameState.currentPlayer === 2 && gameState.matched.length < gameState.cards.length) {
                setTimeout(() => {
                    makeComputerMove();
                }, 800);
            }
        }, 1000);
    }
}

function makeComputerMove() {
    if (!gameState.canFlip || gameState.matched.length >= gameState.cards.length) return;
    
    // Find unmatched cards
    const unmatchedCards = gameState.cards
        .map((symbol, index) => ({ symbol, index }))
        .filter(card => !gameState.matched.includes(card.index) && !gameState.flipped.includes(card.index));
    
    if (unmatchedCards.length === 0) return;
    
    // Try to find a match if we remember any cards
    let firstCard = null;
    let secondCard = null;
    
    // Look for pairs we've seen before
    for (let i = 0; i < unmatchedCards.length; i++) {
        for (let j = i + 1; j < unmatchedCards.length; j++) {
            if (unmatchedCards[i].symbol === unmatchedCards[j].symbol) {
                firstCard = unmatchedCards[i];
                secondCard = unmatchedCards[j];
                break;
            }
        }
        if (firstCard) break;
    }
    
    // If no match found, pick random cards
    if (!firstCard) {
        firstCard = unmatchedCards[Math.floor(Math.random() * unmatchedCards.length)];
        const remainingCards = unmatchedCards.filter(card => card.index !== firstCard.index);
        if (remainingCards.length > 0) {
            secondCard = remainingCards[Math.floor(Math.random() * remainingCards.length)];
        }
    }
    
    // Make the moves
    if (firstCard && secondCard) {
        flipCard(firstCard.index);
        setTimeout(() => {
            flipCard(secondCard.index);
        }, 300);
    }
}

function showMemoryResult(message) {
    const resultDiv = document.getElementById('memory-result');
    resultDiv.style.display = 'block';
    resultDiv.textContent = message;
    resultDiv.className = 'result win';
}

function resetMemoryGame() {
    const symbols = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎪', '🎨'];
    gameState = {
        cards: [...symbols, ...symbols].sort(() => Math.random() - 0.5),
        flipped: [],
        matched: [],
        canFlip: true,
        player1Score: 0,
        player2Score: 0,
        currentPlayer: 1,
        moves: 0
    };
    document.getElementById('player1-matches').textContent = '0';
    document.getElementById('player2-matches').textContent = '0';
    document.getElementById('moves').textContent = '0';
    document.getElementById('current-memory-player').textContent = 'Player 1';
    document.getElementById('current-memory-player').style.color = '#ff6b6b';
    document.getElementById('memory-result').style.display = 'none';
    renderMemoryBoard();
} 

// Snake Game
function loadSnakeGame() {
    gameState = {
        snake: [{x: 10, y: 10}],
        food: {x: 15, y: 15},
        direction: 'right',
        nextDirection: 'right',
        score: 0,
        gameOver: false,
        gridSize: 20,
        speed: 150,
        player1Score: 0,
        player2Score: 0,
        currentPlayer: 1,
        player1Snake: [{x: 5, y: 10}],
        player2Snake: [{x: 15, y: 10}],
        player1Direction: 'right',
        player2Direction: 'left',
        player1NextDirection: 'right',
        player2NextDirection: 'left',
        food1: {x: 8, y: 8},
        food2: {x: 12, y: 12}
    };
    
    const player2Name = gameMode === 'single' ? 'Computer' : 'Player 2';
    
    const gameHTML = `
        <h2 class="game-title">🐍 Snake Game</h2>
        <div class="score-board">
            <div>Player 1: <span id="player1-snake-score">0</span></div>
            <div>${player2Name}: <span id="player2-snake-score">0</span></div>
            <div>Current Score: <span id="current-snake-score">0</span></div>
        </div>
        <div class="game-area">
            <p>Current Player: <span id="current-snake-player" style="color: #ff6b6b; font-weight: bold;">Player 1</span></p>
            <canvas id="snake-canvas" width="400" height="400" style="border: 2px solid #fff; border-radius: 10px;"></canvas>
            <div class="snake-controls">
                <p>Use arrow keys or WASD to control the snake</p>
                <button class="btn" onclick="startSnakeGame()">Start Game</button>
                <button class="btn" onclick="pauseSnakeGame()">Pause</button>
            </div>
        </div>
        <div id="snake-result" class="result" style="display: none;"></div>
        <div class="game-area">
            <button class="btn" onclick="resetSnakeGame()">New Game</button>
        </div>
    `;
    
    document.getElementById('game-content').innerHTML = gameHTML;
    setupSnakeControls();
    renderSnakeGame();
}

function setupSnakeControls() {
    document.addEventListener('keydown', handleSnakeKeyPress);
}

function handleSnakeKeyPress(event) {
    if (!gameState.gameOver) {
        switch(event.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (gameState.direction !== 'down') {
                    gameState.nextDirection = 'up';
                }
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (gameState.direction !== 'up') {
                    gameState.nextDirection = 'down';
                }
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (gameState.direction !== 'right') {
                    gameState.nextDirection = 'left';
                }
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (gameState.direction !== 'left') {
                    gameState.nextDirection = 'right';
                }
                break;
        }
    }
}

function startSnakeGame() {
    if (snakeGameLoop) {
        clearInterval(snakeGameLoop);
    }
    gameState.gameOver = false;
    snakeGameLoop = setInterval(updateSnakeGame, gameState.speed);
}

function pauseSnakeGame() {
    if (snakeGameLoop) {
        clearInterval(snakeGameLoop);
        snakeGameLoop = null;
    }
}

function updateSnakeGame() {
    if (gameState.gameOver) return;
    
    // Update direction
    gameState.direction = gameState.nextDirection;
    
    // Move snake
    const head = {...gameState.snake[0]};
    switch(gameState.direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    
    // Check collision with walls
    if (head.x < 0 || head.x >= gameState.gridSize || head.y < 0 || head.y >= gameState.gridSize) {
        gameOver();
        return;
    }
    
    // Check collision with self
    if (gameState.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    // Check if food eaten
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
        gameState.score++;
        document.getElementById('current-snake-score').textContent = gameState.score;
        generateFood();
    } else {
        gameState.snake.pop();
    }
    
    gameState.snake.unshift(head);
    renderSnakeGame();
}

function generateFood() {
    do {
        gameState.food = {
            x: Math.floor(Math.random() * gameState.gridSize),
            y: Math.floor(Math.random() * gameState.gridSize)
        };
    } while (gameState.snake.some(segment => segment.x === gameState.food.x && segment.y === gameState.food.y));
}

function gameOver() {
    gameState.gameOver = true;
    if (snakeGameLoop) {
        clearInterval(snakeGameLoop);
        snakeGameLoop = null;
    }
    
    // Award points to current player
    if (gameState.currentPlayer === 1) {
        gameState.player1Score += gameState.score;
        document.getElementById('player1-snake-score').textContent = gameState.player1Score;
    } else {
        gameState.player2Score += gameState.score;
        document.getElementById('player2-snake-score').textContent = gameState.player2Score;
    }
    
    showSnakeResult(`Game Over! Score: ${gameState.score}`);
    
    // Switch players
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    const currentPlayerSpan = document.getElementById('current-snake-player');
    const player2Name = gameMode === 'single' ? 'Computer' : 'Player 2';
    currentPlayerSpan.textContent = gameState.currentPlayer === 1 ? 'Player 1' : player2Name;
    currentPlayerSpan.style.color = gameState.currentPlayer === 1 ? '#ff6b6b' : '#4ecdc4';
    
    // Reset for next round
    setTimeout(() => {
        resetSnakeRound();
    }, 2000);
}

function resetSnakeRound() {
    gameState.snake = [{x: 10, y: 10}];
    gameState.direction = 'right';
    gameState.nextDirection = 'right';
    gameState.score = 0;
    gameState.gameOver = false;
    gameState.food = {x: 15, y: 15};
    document.getElementById('current-snake-score').textContent = '0';
    document.getElementById('snake-result').style.display = 'none';
    renderSnakeGame();
}

function renderSnakeGame() {
    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas.getContext('2d');
    const cellSize = canvas.width / gameState.gridSize;
    
    // Clear canvas
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gameState.gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
    }
    
    // Draw snake
    ctx.fillStyle = gameState.currentPlayer === 1 ? '#e74c3c' : '#3498db';
    gameState.snake.forEach((segment, index) => {
        if (index === 0) {
            // Head
            ctx.fillStyle = gameState.currentPlayer === 1 ? '#c0392b' : '#2980b9';
        } else {
            // Body
            ctx.fillStyle = gameState.currentPlayer === 1 ? '#e74c3c' : '#3498db';
        }
        ctx.fillRect(segment.x * cellSize + 1, segment.y * cellSize + 1, cellSize - 2, cellSize - 2);
    });
    
    // Draw food
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(
        gameState.food.x * cellSize + cellSize / 2,
        gameState.food.y * cellSize + cellSize / 2,
        cellSize / 3,
        0,
        2 * Math.PI
    );
    ctx.fill();
}

function showSnakeResult(message) {
    const resultDiv = document.getElementById('snake-result');
    resultDiv.style.display = 'block';
    resultDiv.textContent = message;
    resultDiv.className = 'result win';
}

function resetSnakeGame() {
    if (snakeGameLoop) {
        clearInterval(snakeGameLoop);
        snakeGameLoop = null;
    }
    
    gameState = {
        snake: [{x: 10, y: 10}],
        food: {x: 15, y: 15},
        direction: 'right',
        nextDirection: 'right',
        score: 0,
        gameOver: false,
        gridSize: 20,
        speed: 150,
        player1Score: 0,
        player2Score: 0,
        currentPlayer: 1,
        player1Snake: [{x: 5, y: 10}],
        player2Snake: [{x: 15, y: 10}],
        player1Direction: 'right',
        player2Direction: 'left',
        player1NextDirection: 'right',
        player2NextDirection: 'left',
        food1: {x: 8, y: 8},
        food2: {x: 12, y: 12}
    };
    
    document.getElementById('player1-snake-score').textContent = '0';
    document.getElementById('player2-snake-score').textContent = '0';
    document.getElementById('current-snake-score').textContent = '0';
    document.getElementById('current-snake-player').textContent = 'Player 1';
    document.getElementById('current-snake-player').style.color = '#ff6b6b';
    document.getElementById('snake-result').style.display = 'none';
    renderSnakeGame();
} 