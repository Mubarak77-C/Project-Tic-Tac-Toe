//console.log('hi')
//module function -outer fun and inner function 
const Gameboard = (function () {
    //arr defin for 9 box gridl
    const board = ['', '', '', '', '', '', '', '', ''];
    const getBoard = () => board;

    const setMarker = (index, marker) => {
        if (board[index] !== '') {
            return false; //invalid move;
        }
        board[index] = marker;
        return true;
    };

    const resetBoard = () => {
        board.fill('');
    };

    return {
        getBoard,
        setMarker,
        resetBoard
    };
})();

//step 2:
// ==========================================
// 2. THE PLAYER FACTORY
// ==========================================
// A factory function that creates unique player objects. 
// We use a factory (not an IIFE) because we need two separate instances (Player 1 and Player 2).
const createPlayer = (name, marker) => {
    return {
        name,
        marker
    };
};


// ==========================================
// 3. THE GAME FLOW CONTROLLER (Module Pattern)
// ==========================================
// An IIFE that manages turn-taking, win/tie validation, and round execution.
const GameController = (function() {
    const players = [
        createPlayer("Player One", "X"),
        createPlayer("Player Two", "O")
    ];

    let activePlayer = players[0];
    let isGameOver = false; // <-- NEW: Tracks if the game has ended

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const getActivePlayer = () => activePlayer;

    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]            // Diagonals
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

    // Modified to return status object so UI can react
    const playRound = (index) => {
        // GUARD CLAUSE: If game is over, reject any moves immediately
        if (isGameOver) {
            return { result: 'over' };
        }

        const success = Gameboard.setMarker(index, activePlayer.marker);
        
        if (!success) {
            return { result: 'invalid' };
        }

        const currentBoard = Gameboard.getBoard();
        const gameStatus = checkWinOrTie(currentBoard);

        if (gameStatus.result === 'win') {
            isGameOver = true; // Lock the game!
            return { result: 'win', winner: activePlayer };
        }

        if (gameStatus.result === 'tie') {
            isGameOver = true; // Lock the game!
            return { result: 'tie' };
        }

        // If ongoing, switch turn
        switchPlayerTurn();
        return { result: 'ongoing' };
    };

    return {
        playRound,
        getActivePlayer,
        getBoard: Gameboard.getBoard,
        resetGame: () => {
            Gameboard.resetBoard();
            activePlayer = players[0];
            isGameOver = false; // <-- Unlock the game on reset
            console.log("Game reset.");
        }
    };
})();


// ==========================================
// 4. THE DISPLAY CONTROLLER (Module Pattern)
// ==========================================
// Handles all DOM rendering and user interaction events.
const DisplayController = (function () {

    // Cache DOM elements
    const boardContainer = document.getElementById('board');
    const statusDiv = document.getElementById('status');
    const resetBtn = document.getElementById('reset-btn');
    const cells = document.querySelectorAll('.cell');

    // Render the current state of the board onto the screen
    const renderBoard = () => {
        const currentBoard = Gameboard.getBoard();

        cells.forEach((cell, index) => {
            cell.textContent = currentBoard[index];
        });
    };

    // Update the status text dynamically
    const updateStatus = (message) => {
        statusDiv.textContent = message;
    };

    // --- EVENT LISTENERS ---

    // 1. Click listener for the grid cells
    boardContainer.addEventListener('click', (e) => {
        const targetCell = e.target;

        // Ensure the user clicked an actual cell, not the gap between them
        if (!targetCell.classList.contains('cell')) return;

        const index = targetCell.getAttribute('data-index');

        // Play round via GameController
        // (We can check if the game is already won/tied or let GameController handle turn logic)
        const activePlayerBefore = GameController.getActivePlayer();

        // Attempt move
        const currentBoard = Gameboard.getBoard();
        if (currentBoard[index] !== '') return; // Spot taken, do nothing

        // Execute move
        GameController.playRound(Number(index));
        renderBoard();

        // Update status text based on game outcome
        const updatedBoard = Gameboard.getBoard();

        // Quick check for win/tie state to update text banner
        // (We can extract this cleanly, or read from GameController state)
        const nextPlayer = GameController.getActivePlayer();
        updateStatus(`${nextPlayer.name}'s (${nextPlayer.marker}) turn`);
    });

    // 2. Click listener for the reset button
    resetBtn.addEventListener('click', () => {
        GameController.resetGame();
        renderBoard();
        updateStatus("Player One's (X) turn");
    });

    // Initial render call on load
    renderBoard();

    return {
        renderBoard,
        updateStatus
    };
})();




// Check initial state
console.log(GameController.getActivePlayer()); // Should be Player One (X)

// Play a few moves
GameController.playRound(0); // Player One places X at top-left
GameController.playRound(4); // Player Two places O at center
GameController.playRound(1); // Player One places X at top-middle
console.log([...GameController.getBoard()]); // View board state safely

// Simulate Player One winning the top row
GameController.playRound(8); // Player Two blocks somewhere
GameController.playRound(2); // Player One places X at top-right -> WIN!

//don't chain calling like below it perform in one shot only getting and reset it so array empty 
//it don't work as step by step sequence call it work return by reference
//console.log(Gameboard.setMarker(0, 'x'), Gameboard.getBoard(), Gameboard.resetBoard());
//call by proffessional step by step 
// Gameboard.setMarker(0,'X')

// console.log(Gameboard.getBoard())  //x will place at first index
// // console.log(Gameboard.resetBoard()); //now it undefined
//  Gameboard.resetBoard()  //this is write to call .
//  console.log(Gameboard.getBoard()) //because of reset it will empty will appear on 1st index above also

//  //or by ...spread operation save zone
//  console.log(
//     Gameboard.setMarker(0, 'x'), 
//     [...Gameboard.getBoard()], // Spread creates a safe clone!
//     Gameboard.resetBoard()
// );