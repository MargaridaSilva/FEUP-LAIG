class MyGame extends CGFobject {

    constructor(scene, dim, div){
        super(scene);
        this.board = new MyBoard(this.scene, dim, div);
        this.div = div;
        this.isOver=false;
        this.moveStack = [];
        /* Game Properties */
        this.dim = -1;
        this.numTurns = 3;
        this.turn=this.numTurns;
        this.AI = -1;
        this.currentPlayer = -1;
        this.playersType= [];
        this.playersTypes = [["user","computer"], ["user","user"], ["computer","computer"]];
        this.logic = new MyGameInterface();
        this.pieceHolder = [new PieceHolder(this.scene), new PieceHolder(this.scene)];
    }

    update(dt){
    }

    display(){
        this.board.display();

        let rAliv = MyPiece.pieces['rAliv'];
        let rDead = MyPiece.pieces['rDead'];

        let bAliv = MyPiece.pieces['bAliv'];
        let bDead = MyPiece.pieces['bDead'];

        this.scene.pushMatrix();
            this.scene.translate(0, 0, 6);

            this.scene.pushMatrix();
            this.scene.translate(-1, 0, 0);
            rDead.display();
            this.scene.popMatrix();

            this.scene.pushMatrix();
            this.scene.translate(1, 0, 0);
            rAliv.display();
            this.scene.popMatrix();

            this.scene.pushMatrix();
            this.scene.scale(2, 2, 2);
            this.pieceHolder[0].display();
            this.scene.popMatrix();

        this.scene.popMatrix();

        this.scene.pushMatrix();
            this.scene.translate(0, 0, -6);

            this.scene.pushMatrix();
            this.scene.translate(-1, 0, 0);
            bDead.display();
            this.scene.popMatrix();

            this.scene.pushMatrix();
            this.scene.translate(1, 0, 0);
            bAliv.display();
            this.scene.popMatrix();

            this.scene.pushMatrix();
            this.scene.scale(2, 2, 2);
            this.pieceHolder[1].display();
            this.scene.popMatrix();

        this.scene.popMatrix();
    }


    updateCoords(s, t){
    }

    start(dim, currentPlayer, playersType, AI){
        this.dim = dim;
        this.currentPlayer = currentPlayer;
        this.playersType = this.playersTypes[playersType];
        this.AI = parseInt(AI) + 1;
        this.printGameState();
        this.board = new MyBoard(this.scene, dim, this.div);
        this.logic.start(this.dim, this.dim, this);
    }

    dispatchComputerMoves(){
        console.log("heeeeeeeeeeeere");
        if (this.playersType[this.currentPlayer] == 'computer'){
            this.logic.moveComputer(this.boardPL, this.turn, this.currentPlayer, this.AI, this);
        }
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

        if(moveType == 'mov'){
            let moveStruct = this.parseMove(move);
            this.board.movePieceToCell(moveStruct.row, moveStruct.col);
        }

        this.dispatchComputerMoves();
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
        let picked = pickedElements[0][1];
        console.log(this.playersType[this.currentPlayer]);
        if(picked != undefined && this.playersType[this.currentPlayer] == 'user'){
            let move = this.convertCellNumToRowAndCol(pickedElements[0][1]);
            this.logic.moveUser(move, this.boardPL, this.turn, this.currentPlayer, this);
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
        console.log("Current Player: " + this.currentPlayer);
        console.log("Turn: "+ this.turn);
        console.log("Is Over?: "+ this.isOver);
        console.log("Board: "+ this.boardPL);
        console.log("AI: "+ this.AI);
        console.log("Players Type: " + this.playersType);

    }
}