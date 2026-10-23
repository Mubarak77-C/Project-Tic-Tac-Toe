//console.log('hi')
//module function -outer fun and inner function 
// ==========================================
// 1. THE GAMEBOARD MODULE
// ==========================================
const Gameboard = (function() {
    const board = ['', '', '', '', '', '', '', '', ''];
    const getBoard = () => board;

    const setMarker = (index, marker) => {
        if (board[index] !== '') return false;
        board[index] = marker;
        return true;
    };

    const resetBoard = () => {
        board.fill('');
    };

    return { getBoard, setMarker, resetBoard };
})();


// ==========================================
// 2. THE PLAYER FACTORY
// ==========================================
const createPlayer = (name, marker) => {
    return { name, marker };
};


// ==========================================
// 3. THE GAME FLOW CONTROLLER (Enhanced)
// ==========================================
const GameController = (function() {
    let players = [
        createPlayer("Player One", "X"),
        createPlayer("Player Two", "O")
    ];

    let activePlayer = players[0];
    let isGameOver = false;

    // --- NEW: Score Tracker State ---
    let scores = {
        X: 0,
        O: 0,
        ties: 0
    };

    const setPlayerNames = (name1, name2) => {
        players[0].name = name1 || "Player One";
        players[1].name = name2 || "Player Two";
    };

    const getScores = () => scores;

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const getActivePlayer = () => activePlayer;

    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    const checkWinOrTie = (board) => {
        for (let combo of winningCombinations) {
            const [a, b, c] = combo;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return { result: 'win', winner: activePlayer };
            }
        }
        if (!board.includes('')) {
            return { result: 'tie' };
        }
        return { result: 'ongoing' };
    };

    const playRound = (index) => {
        if (isGameOver) return { result: 'over' };

        const success = Gameboard.setMarker(index, activePlayer.marker);
        if (!success) return { result: 'invalid' };

        const currentBoard = Gameboard.getBoard();
        const gameStatus = checkWinOrTie(currentBoard);

        if (gameStatus.result === 'win') {
            isGameOver = true;
            scores[activePlayer.marker]++; // Increment winner's score
            return { result: 'win', winner: activePlayer };
        }

        if (gameStatus.result === 'tie') {
            isGameOver = true;
            scores.ties++; // Increment tie score
            return { result: 'tie' };
        }

        switchPlayerTurn();
        return { result: 'ongoing' };
    };

    const resetRound = () => {
        Gameboard.resetBoard();
        activePlayer = players[0];
        isGameOver = false;
    };

    const fullReset = () => {
        resetRound();
        scores = { X: 0, O: 0, ties: 0 };
    };

    return {
        playRound,
        getActivePlayer,
        getBoard: Gameboard.getBoard,
        setPlayerNames,
        getScores,
        resetRound,
        fullReset
    };
})();


// ==========================================
// 4. THE DISPLAY CONTROLLER (Enhanced)
// ==========================================
const DisplayController = (function() {
    const boardContainer = document.getElementById('board');
    const statusDiv = document.getElementById('status');
    const resetBtn = document.getElementById('reset-btn');
    const fullResetBtn = document.getElementById('full-reset-btn');
    const setNamesBtn = document.getElementById('set-names-btn');
    
    const p1Input = document.getElementById('p1-input');
    const p2Input = document.getElementById('p2-input');
    
    const scoreP1Label = document.getElementById('score-p1-label');
    const scoreP2Label = document.getElementById('score-p2-label');
    const scoreP1 = document.getElementById('score-p1');
    const scoreP2 = document.getElementById('score-p2');
    const scoreTies = document.getElementById('score-ties');
    
    const cells = document.querySelectorAll('.cell');

    const renderBoard = () => {
        const currentBoard = Gameboard.getBoard();
        cells.forEach((cell, index) => {
            cell.textContent = currentBoard[index];
        });
    };

    const updateScoreboard = () => {
        const scores = GameController.getScores();
        scoreP1.textContent = scores.X;
        scoreP2.textContent = scores.O;
        scoreTies.textContent = scores.ties;

        scoreP1Label.textContent = p1Input.value || "Player One";
        scoreP2Label.textContent = p2Input.value || "Player Two";
    };

    const updateStatus = (message) => {
        statusDiv.textContent = message;
    };

    // Event Listener: Grid Clicks
    boardContainer.addEventListener('click', (e) => {
        const targetCell = e.target;
        if (!targetCell.classList.contains('cell')) return;

        const index = targetCell.getAttribute('data-index');
        const currentBoard = Gameboard.getBoard();
        if (currentBoard[index] !== '') return;

        const roundResult = GameController.playRound(Number(index));
        if (roundResult.result === 'over') return;

        renderBoard();

        if (roundResult.result === 'win') {
            updateStatus(`🎉 Winner: ${roundResult.winner.name} (${roundResult.winner.marker})!`);
            updateScoreboard();
        } else if (roundResult.result === 'tie') {
            updateStatus(`It's a Tie Game! 🤝`);
            updateScoreboard();
        } else {
            const nextPlayer = GameController.getActivePlayer();
            updateStatus(`${nextPlayer.name}'s (${nextPlayer.marker}) turn`);
        }
    });

    // Event Listener: Set Names Button
    setNamesBtn.addEventListener('click', () => {
        GameController.setPlayerNames(p1Input.value, p2Input.value);
        updateScoreboard();
        const activePlayer = GameController.getActivePlayer();
        updateStatus(`${activePlayer.name}'s (${activePlayer.marker}) turn`);
    });

    // Event Listener: Next Round Button
    resetBtn.addEventListener('click', () => {
        GameController.resetRound();
        renderBoard();
        const activePlayer = GameController.getActivePlayer();
        updateStatus(`${activePlayer.name}'s (${activePlayer.marker}) turn`);
    });

    // Event Listener: Full Reset Button
    fullResetBtn.addEventListener('click', () => {
        GameController.fullReset();
        renderBoard();
        updateScoreboard();
        const activePlayer = GameController.getActivePlayer();
        updateStatus(`${activePlayer.name}'s (${activePlayer.marker}) turn`);
    });

    renderBoard();
    updateScoreboard();

    return { renderBoard, updateStatus };
})();


// // Check initial state
// console.log(GameController.getActivePlayer()); // Should be Player One (X)

// // Play a few moves
// GameController.playRound(0); // Player One places X at top-left
// GameController.playRound(4); // Player Two places O at center
// GameController.playRound(1); // Player One places X at top-middle
// console.log([...GameController.getBoard()]); // View board state safely

// // Simulate Player One winning the top row
// GameController.playRound(8); // Player Two blocks somewhere
// GameController.playRound(2); // Player One places X at top-right -> WIN!

// //don't chain calling like below it perform in one shot only getting and reset it so array empty 
// //it don't work as step by step sequence call it work return by reference
// //console.log(Gameboard.setMarker(0, 'x'), Gameboard.getBoard(), Gameboard.resetBoard());
// //call by proffessional step by step 
// // Gameboard.setMarker(0,'X')

// // console.log(Gameboard.getBoard())  //x will place at first index
// // // console.log(Gameboard.resetBoard()); //now it undefined
// //  Gameboard.resetBoard()  //this is write to call .
// //  console.log(Gameboard.getBoard()) //because of reset it will empty will appear on 1st index above also

// //  //or by ...spread operation save zone
// //  console.log(
// //     Gameboard.setMarker(0, 'x'), 
// //     [...Gameboard.getBoard()], // Spread creates a safe clone!
// //     Gameboard.resetBoard()
// // );