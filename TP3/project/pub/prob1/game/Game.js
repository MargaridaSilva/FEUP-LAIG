class Game extends CGFobject {

    constructor(scene, dim, div){
        super(scene);
        /* Visual elements */
        this.div = div;
        this.board = new Board(this.scene, dim, div);
        this.pieceHolder = [new PieceHolder(this.scene), new PieceHolder(this.scene)];

        /* Game Properties */
        this.dim = dim;
        this.numTurns = 3;
        this.playersType= [];
        this.playersTypes = [["user","computer"], ["user","user"], ["computer","computer"]];
        this.logic = new GameInterface();

        /* Game State */
        this.state = [];
        this.stateStack = [];
    }

    start(dim, currentPlayer, playersType, AI){
        /* Game Properties */
        this.dim = dim;
        this.board = new Board(this.scene, this.dim, this.div);
        this.AI = parseInt(AI) + 1;
        this.playersType = this.playersTypes[playersType];

        /* Game State */
        this.updateState(currentPlayer, this.numTurns, null, null, false, null);
        this.printGameState();

        /* Game Logic */
        this.logic.start(this.dim, this.dim, this);
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
                'isOver':end,
                'winner':winner
            }
        }
        
    }

    /*Update functions */

    updateBoard(newBoard){
        this.state.boardPL = newBoard;
    }

    updateWinner(winner) {
        if (winner != -1){
            this.state.isOver = true;
            this.state.winner = winner;
        }
    }

    updateWithMovement(moveType, move, newTurn, newPlayer, currentSymbol) {
        let previousPlayer = this.state.currentPlayer;
        this.updateState(newPlayer, newTurn, move, moveType, false, null);
        this.logic.checkWinner(this.getPrologBoard(), this);

        if(moveType == 'mov' || moveType == 'zom'){
            let moveStruct = this.parseMove(move);
            this.board.movePieceToCell(moveStruct.row - 1, moveStruct.col - 1, currentSymbol);
        }
    }

    handlePicking(pickedElements){

        let picked = pickedElements[0][1];
        let playerType = this.playersType[this.state.currentPlayer];

        if(picked != undefined && playerType == 'user' && !this.board.movementOccuring){
            let move = this.convertCellNumToRowAndCol(pickedElements[0][1]);
            this.logic.moveUser(move, this.getPrologBoard(), this.state.turn, this.state.currentPlayer, this);
        }

    }


    dispatchComputerMoves(){
        if (this.playersType[this.state.currentPlayer] == 'computer' && !this.board.movementOccuring){
            this.logic.moveComputer(this.getPrologBoard(), this.state.turn, this.state.currentPlayer, this.AI, this);
        }
    }


    backToPreviousState(){
        if (this.stateStack.length > 0){
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

    update(dt){
        this.board.update(dt);
        this.dispatchComputerMoves();
    }

    display(){
        this.board.display();

        this.scene.pushMatrix();
            this.scene.translate(0, 0, 6);
            this.scene.pushMatrix();
            this.scene.scale(2, 2, 2);
            this.pieceHolder[0].display();
            this.scene.popMatrix();
        this.scene.popMatrix();

        this.scene.pushMatrix();
            this.scene.translate(0, 0, -6);
            this.scene.pushMatrix();
            this.scene.scale(2, 2, 2);
            this.pieceHolder[1].display();
            this.scene.popMatrix();
        this.scene.popMatrix();
    }


    /* Utilities */

    updateCoords(s, t){
    }        

    getPrologBoard(){
        let prologBoard = this.board.toString() + "-[" + this.dim + "," + this.dim +"]";
        return prologBoard;
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

}