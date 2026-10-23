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

//don't chain calling like below it perform in one shot only getting and reset it so array empty 
//it don't work as step by step sequence call it work return by reference
//console.log(Gameboard.setMarker(0, 'x'), Gameboard.getBoard(), Gameboard.resetBoard());
//call by proffessional step by step 
Gameboard.setMarker(0,'X')

console.log(Gameboard.getBoard())  //x will place at first index
// console.log(Gameboard.resetBoard()); //now it undefined
 Gameboard.resetBoard()  //this is write to call .
 console.log(Gameboard.getBoard()) //because of reset it will empty will appear on 1st index above also

 //or by ...spread operation save zone
 console.log(
    Gameboard.setMarker(0, 'x'), 
    [...Gameboard.getBoard()], // Spread creates a safe clone!
    Gameboard.resetBoard()
);