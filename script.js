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
    
    // Instantiate our two players using the Player Factory
    const players = [
        createPlayer("Player One", "X"),
        createPlayer("Player Two", "O")
    ];

    // Track whose turn it is currently
    let activePlayer = players[0]; // Player One always starts

    // Helper function to switch turns
    const switchPlayerTurn = () => {
        // Ternary operator: if active is player 0, switch to player 1, else switch to player 0
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    // Public getter for the UI to know who is active
    const getActivePlayer = () => activePlayer;

    // Helper to print current round info to console
    const printNewRound = () => {
        console.log(`${getActivePlayer().name}'s (${getActivePlayer().marker}) turn.`);
    };

    // Winning combinations indices on a 3x3 grid (Rows, Columns, Diagonals)
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]            // Diagonals
    ];

    // Check if the current board state results in a win or a tie
    const checkWinOrTie = (board) => {
        // 1. Loop through all winning combinations
        for (let combo of winningCombinations) {
            const [a, b, c] = combo;
            // Check if all three spots have the same marker and are not empty
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return { result: 'win', winner: activePlayer };
            }
        }

        // 2. Check for a tie (if board has no empty strings left)
        if (!board.includes('')) {
            return { result: 'tie' };
        }

        // 3. Otherwise, game is still ongoing
        return { result: 'ongoing' };
    };

    // Core method: Play a round at a specific grid index (0-8)
    const playRound = (index) => {
        // Attempt to place marker using the Gameboard module
        const success = Gameboard.setMarker(index, activePlayer.marker);
        
        // If the spot was already taken, exit early without changing turns
        if (!success) {
            console.log("Invalid move! Spot is already taken.");
            return; 
        }

        // Fetch current board state to check win conditions
        const currentBoard = Gameboard.getBoard();
        const gameStatus = checkWinOrTie(currentBoard);

        // Handle Win state
        if (gameStatus.result === 'win') {
            console.log(`🎉 ${gameStatus.winner.name} wins the game!`);
            return;
        }

        // Handle Tie state
        if (gameStatus.result === 'tie') {
            console.log(`It's a tie game!`);
            return;
        }

        // If no win or tie, switch turn to the next player
        switchPlayerTurn();
        printNewRound();
    };

    // Public API exposed to the world
    return {
        playRound,
        getActivePlayer,
        getBoard: Gameboard.getBoard,
        resetGame: () => {
            Gameboard.resetBoard();
            activePlayer = players[0];
            console.log("Game reset. Player One's turn.");
        }
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