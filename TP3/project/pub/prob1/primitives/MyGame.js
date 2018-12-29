class MyGame extends CGFobject {

    constructor(scene, dim, div){
        super(scene);
        this.board = new MyBoard(this.scene, dim, div);
        this.div = div;
        this.isOver=false;
        /* Game Properties */
        this.dim = -1;
        this.numTurns = 3;
        this.AI = -1;
        this.playersType= [];
        this.playersTypes = [["user","computer"], ["user","user"], ["computer","computer"]];
        this.logic = new MyGameInterface();

        /* Game State */
        this.state = [];
        this.stateStack = [];
    }

    update(dt){

    }
    display(){
        this.board.display();
    }

    updateCoords(s, t){
    }

    updateState(currentPlayer, turn, move, moveType, end, winner){
        if (moveType != "invalid"){
            this.stateStack.push(this.state);
            let moveParsed = JSON.parse(move);
            this.state = {
            'currentPlayer':currentPlayer,
            'turn':turn,
            'move':moveParsed,
            'moveType':moveType,
            'end':end,
            'winner':winner
            }
        }
        
    }

    start(dim, currentPlayer, playersType, AI){
        this.dim = dim;
        this.updateState(currentPlayer, this.numTurns, null, null, false, null);

        this.playersType = this.playersTypes[playersType];
        this.AI = parseInt(AI) + 1;
        this.printGameState();

        //this.board = new MyBoard(this.scene, dim, dim);
        this.logic.start(this.dim, this.dim, this);
    }

    dispatchComputerMoves(){
        if (this.playersType[this.state.currentPlayer] == 'computer'){
            this.logic.moveComputer(this.getPrologBoard(), this.state.turn, this.state.currentPlayer, this.AI, this);
        }
    }

    updateBoard(newBoard){
        this.state.boardPL = newBoard;
    }

    updateWithMovement(moveType, move, newTurn, newPlayer) {
        let previousPlayer = this.state.currentPlayer;
        this.updateState(newPlayer, newTurn, move, moveType, false, null);
        this.logic.checkWinner(this.getPrologBoard(), this);

        if(moveType == 'mov'){
            let moveStruct = this.parseMove(move);
            this.board.movePieceToCell(moveStruct.row, moveStruct.col, previousPlayer);
        }

        this.dispatchComputerMoves();
    }

    updateWinner(winner) {
        if (winner != -1){
            this.state.isOver = true;
            this.state.winner = winner;
        }
    }

    getPrologBoard(){
        let prologBoard = this.board.toString() + "-[" + this.dim + "," + this.dim +"]";
        return prologBoard;
    }

    handlePicking(pickedElements){
        let picked = pickedElements[0][1];
        let playerType = this.playersType[this.state.currentPlayer];
        if(picked != undefined && playerType == 'user'){
            let move = this.convertCellNumToRowAndCol(pickedElements[0][1]);
            this.logic.moveUser(move, this.getPrologBoard(), this.state.turn, this.state.currentPlayer, this);
        }
        
        // this.printGameState();
    }

    convertCellNumToRowAndCol(num){
        let row = Math.floor(num/this.dim);
        let col = num%(this.dim);
        if (num%this.dim != 0) 
            row++;
        else col = this.dim;
        return [row, col];
    }

    parseMove(movestr){
        let move = movestr.slice(1,-1).split(',');
        return {
            row: Number(move[0]), 
            col: Number(move[1])
        };

    }

    printGameState(){
        console.log("Board Dimension: " + this.dim);
        console.log("Current Player: " + this.state.currentPlayer);
        console.log("Turn: "+ this.state.turn);
        console.log("Is Over?: "+ this.state.isOver);
        console.log("Board: "+ this.state.boardPL);
        console.log("AI: "+ this.AI);
        console.log("Players Type: " + this.playersType);

    }

    backToPreviousState(){
        if (this.stateStack.length > 1){
            let playerType;
            do {
            let move = this.state.move;   
            this.board.revertStateAt(move[0], move[1]);    
            this.state = this.stateStack.peek();
            this.stateStack.pop();
            console.log(this.stateStack);
            playerType = this.playersType[this.state.currentPlayer];
            console.log(playerType);
            } while(playerType == "computer");
        }
    }
}