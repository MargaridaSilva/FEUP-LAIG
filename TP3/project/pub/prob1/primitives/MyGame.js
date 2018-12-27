class MyGame extends CGFobject {

    constructor(scene, dim, div){
        super(scene);
        this.board = new MyBoard(this.scene, dim, div);
        this.currentPlayer;
        this.turn=0;
    }


    update(dt){

    }

    
    display(){
        this.board.display();
    }

    updateCoords(s, t){
    }

    
    getBoardProlog(){
        let prologBoard = this.board.toString() + "-" +  this.dim;
        console.log(prologBoard);
    }

    handlePicking(pickedElements){
        this.board.handlePicking(pickedElements);
    }
}