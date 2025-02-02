class Game extends CGFobject {

    constructor(scene, dim, div){
        super(scene);
        /* Visual elements */
        this.div = div;
        this.board = new Board(this.scene, dim, div);
        this.pieceHolder = [new PieceHolder(this.scene), new PieceHolder(this.scene)];
        this.scoreboard = this.scene.scoreboard;

        /* Game Properties */
        this.dim = dim;
        this.numTurns = 3;
        this.playersType= [];
        this.playersTypes = [["user","computer"], ["user","user"], ["computer","computer"]];
        this.logic = new GameInterface();

        /* Game State */
        this.state = [];
        this.stateStack = [];
        this.gameStart = false;

        this.board = new Board(this.scene, this.dim, this.div);
    }
    start(dim, currentPlayer, gameMode, AI, turnTime){
        /* Game Properties */
        this.dim = dim;
        this.board.changeDim(this.dim);
        this.firstPlayer = currentPlayer;
        this.gameMode = gameMode;
        this.AI = parseInt(AI);
        this.playersType = this.playersTypes[gameMode];
        this.turnTime = turnTime;

        /* Game State */
        this.gameStart = true;
        if(!this.watchMovieMode)
            this.updateState(currentPlayer, this.numTurns, null, null, false, null);

        /* Game Logic */
        this.logic.start(this.dim, this.dim, this);

        this.scoreboard.reset();
        this.scoreboard.start();

        this.updateCamera();

        this.scene.eventEmitter.removeAll();

        this.scene.eventEmitter.on('zeroCountDown', () =>{
            this.state.currentPlayer = (this.state.currentPlayer + 1) % 2;
            this.state.turn = 3;
            this.updateCamera();
        });

        this.scene.eventEmitter.on('automaticCamera', () =>
            this.updateCamera()
        );

        this.scene.eventEmitter.on('cameraAnimationEnd', () => {
            this.resetCountdown();
            if(this.playerChanged){
                this.playerChanged = false;
                this.scoreboard.startCountdown();
            }
        });

        this.scene.eventEmitter.on('pieceAnimationEnd', () => {
            if(this.playerChanged){
                this.updateCamera();
            }
        });
    }

    resetCountdown(){
        this.scoreboard.setCountdownTime((this.turnTime + 0.9) * 1000);
    }

    updateState(currentPlayer, turn, move, moveType, end, winner){        
        if (moveType != "invalid"){
            let previousPlayer = this.state.currentPlayer;
            let moveParsed = JSON.parse(move);
            this.state = {
                'currentPlayer':currentPlayer,
                'previousPlayer': previousPlayer,
                'turn':turn,
                'move':moveParsed,
                'moveType':moveType,
                'isOver':end,
                'winner':winner
            }
            this.stateStack.push(this.state);
        }
        if(this.state.previousPlayer != this.state.currentPlayer){
            this.scoreboard.stopCountdown();
            this.playerChanged = true;
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

    updateWithMovement(moveType, move, newTurn, newPlayer) {
        this.updateState(parseInt(newPlayer), parseInt(newTurn), move, moveType, false, null);
        this.logic.checkWinner(this.getPrologBoard(), this);

        if(moveType != 'invalid'){
            this.updateMovement();
        }
    }

    updateMovement(){
        let move = this.state.move;
        this.board.movePieceToCell(move[0], move[1], this.state.previousPlayer);
        if(this.state.moveType == 'zom'){
            switch(this.state.previousPlayer){
                case 0: this.scoreboard.incrementScorePlayer1(); break;
                case 1: this.scoreboard.incrementScorePlayer2(); break;
            }            
        }
    }

    getSymbol(moveType, player){
        let symbol = {
            0: {mov: 'bAliv', zom: 'bDead'},
            1: {mov: 'rAliv', zom: 'rDead'},
        };
        return symbol[player][moveType];
    }

    handlePicking(pickedElements){
    

        let picked = pickedElements[0][1];
        let playerType = this.playersType[this.state.currentPlayer];

        if(!this.state.isOver && picked != undefined && playerType == 'user' && !this.isMoving()){
            
            let move = this.convertCellNumToRowAndCol(pickedElements[0][1]);
            this.logic.moveUser(move, this.getPrologBoard(), this.state.turn, this.state.currentPlayer, this);
        }

    }


    dispatchComputerMoves(){
        if (!this.state.isOver && this.playersType[this.state.currentPlayer] == 'computer' && !this.isMoving()){
            this.logic.moveComputer(this.getPrologBoard(), this.state.turn, this.state.currentPlayer, this.AI + 1, this);
        }
    }


    backToPreviousState(){

        if(this.playersType[this.state.currentPlayer] == 'user'){

            if (this.stateStack.length > 1){
                this.resetCountdown();
                let playerType;
                do {
                    let move = this.state.move;
                    this.board.revertStateAt(move[0], move[1]);
                    this.stateStack.pop();
                    this.state = this.stateStack.peek();
                    playerType = this.playersType[this.state.currentPlayer];
                } while(playerType == "computer");
            }
        }
    }

    watchMovie(){
        if(this.watchMovieMode) return;

        this.scoreboard.stop();
        this.watchMovieMode = true;
        this.scene.fastMode = true;
        this.watchStack = this.stateStack.slice(1);
        this.start(this.dim, this.firstPlayer, this.gameMode, this.AI, this.turnTime);
    }

    updateWatchMovie(){
        if(!this.isMoving()){
            if(this.watchStack.length == 0){
                this.watchMovieMode = false;
                this.scene.fastMode = false;
                this.scoreboard.start();
            }
            else{
                let state = this.watchStack.shift();
                this.state = state;
                this.updateMovement();
            }
        }
    }

    update(dt){
        this.board.update(dt);

        if(this.gameStart && !this.isMoving()){

            if(this.watchMovieMode){
                this.updateWatchMovie();
            }
            else{
                this.dispatchComputerMoves();
            }
        }
    }

    updateCamera(){
        if(this.scene.interfaceValues.automaticCamera){
            this.scene.interface.changeCamera(this.state.currentPlayer + 1);
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

    printGameState(){
        console.log("Board Dimension: " + this.dim);
        console.log("Current Player: " + this.state.currentPlayer);
        console.log("Turn: "+ this.state.turn);
        console.log("Is Over?: "+ this.state.isOver);
        console.log("Board: "+ this.state.boardPL);
        console.log("AI: "+ this.AI + 1);
        console.log("Players Type: " + this.playersType);

    }

}