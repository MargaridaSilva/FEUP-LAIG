class MyBoard extends CGFobject {

    constructor(scene, dim, div){
        super(scene);
        this.scene = scene;
        this.dim = dim;
        this.div = div;
        this.cells = [];
        this.pieces = [];

        this.initCells();
        MyPiece.initPieces(this.scene);
    }

    initCells(){
        for(let i = 0; i < this.dim; i++){
            for(let j = 0; j < this.dim; j++){
                this.cells.push(new MyCell(this.scene, i, j, this.div, j*this.dim + i + 1));
            }
        }
    }

    display(){        
        this.scene.pushMatrix();
        this.scene.translate(-this.dim/2, 0, -this.dim/2);
        this.scene.translate(0.5, 0, 0.5);

        // draw objects
        this.cells.forEach(function(cell){
           cell.display();
        });
        this.scene.popMatrix();
    }


    updateCoords(s, t){
    }

    toString(){
        let board = "[ ";

        this.cells.forEach(function(cell){
            board += cell.toString() + ', ';
        });

        board = board.substr(0, board.length - ', '.length);

        board += " ]";

        return board;
    }

    handlePicking(pickedElements){
        this.cells.forEach(function(cell){
            cell.handlePicking(pickedElements);
        });
    }
}