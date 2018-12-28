class MyGame extends CGFobject {

    constructor(scene, dim, div){
        super(scene);
        this.dim =dim;
        this.numTurns = 3;
        this.board = new MyBoard(this.scene, dim, div);
        this.currentPlayer = 0;
        this.turn=this.numTurns;
        this.isOver=false;
        this.moveStack = [];
        this.logic = new MyGameInterface();
        this.logic.start(dim, dim, this);
    }

    update(dt){

    }

    display(){
        this.board.display();
    }

    updateCoords(s, t){
    }

    updateBoard(newBoard){
        this.boardPL = newBoard;
    }

    updateWithMovement(moveType, move, newBoard, newTurn, newPlayer) {
        this.moveStack.push([moveType, move]);
        this.boardPL = newBoard;
        this.turn = newTurn;
        this.currentPlayer = newPlayer;
        this.logic.checkWinner(this.boardPL, this);
    }

    updateState(winner) {
        if (winner != -1){
            this.isOver = true;
            this.winner = winner;
        }
    }

    
    getBoardProlog(){
        let prologBoard = this.board.toString() + "-" +  this.dim;
        console.log(prologBoard);
    }

    handlePicking(pickedElements){
        let move = this.convertCellNumToRowAndCol(pickedElements[0][1]);

        this.logic.moveUser(move, this.boardPL, this.turn, this.currentPlayer, this);
        
        //this.printGameState();
        
        this.board.handlePicking(pickedElements);
    }

    convertCellNumToRowAndCol(num){
        let row = Math.floor(num/this.dim);
        let col = num%(this.dim);
        if (num%this.dim != 0) 
            row++;
        else col = this.dim;
        return [row, col];
    }

    printGameState(){
        console.log("Board Dimension: " + this.dim);
        console.log("Current Player: " + this.currentPlayer);
        console.log("Turn: "+ this.turn);
        console.log("Is Over?: "+ this.isOver);
        console.log("Board: "+ this.boardPL);

    }
}