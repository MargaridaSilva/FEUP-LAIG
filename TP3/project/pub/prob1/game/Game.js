class Game extends CGFobject {

    constructor(scene, dim, div){
        super(scene);
        /*Visual elements*/
        this.board = new Board(this.scene, dim, div);
        this.pieceHolder = [new PieceHolder(this.scene), new PieceHolder(this.scene)];

        this.div = div;
        this.isOver=false;
        /* Game Properties */
        this.dim = -1;
        this.numTurns = 3;
        this.AI = -1;
        this.playersType= [];
        this.playersTypes = [["user","computer"], ["user","user"], ["computer","computer"]];
        this.logic = new GameInterface();
        /* Game State */
        this.state = [];
        this.stateStack = [];
        this.gameStart = false;
    }

    start(dim, currentPlayer, playersType, AI){
        this.gameStart = true;

        this.dim = dim;
        this.updateState(currentPlayer, this.numTurns, null, null, false, null);

        this.playersType = this.playersTypes[playersType];
        this.AI = parseInt(AI) + 1;
        this.printGameState();

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
                'end':end,
                'winner':winner
            }
        }
        
    }

    /*Update functions */

    initBoard(newBoard) {
        this.board.initCellsState(newBoard);
    }

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
        this.previousPlayer = this.state.currentPlayer;
        this.updateState(parseInt(newPlayer), parseInt(newTurn), move, moveType, false, null);
        this.logic.checkWinner(this.getPrologBoard(), this);

        if(moveType == 'mov' || moveType == 'zom'){
            let moveStruct = this.parseMove(move);
            this.board.movePieceToCell(moveStruct.row, moveStruct.col, currentSymbol);
        }
    }

    handlePicking(pickedElements){

        let picked = pickedElements[0][1];
        let playerType = this.playersType[this.state.currentPlayer];

        if(picked != undefined && playerType == 'user' && !this.isMoving()){
            let move = this.convertCellNumToRowAndCol(pickedElements[0][1]);
            this.logic.moveUser(move, this.getPrologBoard(), this.state.turn, this.state.currentPlayer, this);
        }

    }


    dispatchComputerMoves(){
        if (this.playersType[this.state.currentPlayer] == 'computer' && !this.isMoving()){
            this.logic.moveComputer(this.getPrologBoard(), this.state.turn, this.state.currentPlayer, this.AI, this);
        }
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

    update(dt){
        this.board.update(dt);

        if(this.gameStart){
            this.updateCamera();
            this.dispatchComputerMoves();
        }
    }

    updateCamera(){
        let playerChanged = (this.previousPlayer != this.state.currentPlayer) || (this.state.currentPlayer + 1 != this.scene.interfaceValues.camera);
        if(playerChanged && !this.isMoving() && this.scene.interfaceValues.automaticCamera){
            this.scene.interface.changeCamera(this.state.currentPlayer + 1);
            this.previousPlayer = this.state.currentPlayer;
        }
    }

    isMoving(){
        return !this.scene.cameraAnimation.end || this.board.movementOccuring;
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