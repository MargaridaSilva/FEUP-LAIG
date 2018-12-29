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

        this.material = new CGFappearance(this.scene);
        this.material.setSpecular(1, 1, 1, 1);
        this.material.setAmbient(1, 1, 1, 1);
        this.material.setDiffuse(0, 0, 0, 1);
        this.texture = new CGFtexture(this.scene, "scenes/images/board2.png"); 
        this.material.setTexture(this.texture);

        this.quad = new MyQuad(this.scene, -1, -1, 1, 1);
    }

    initCells(){
        for(let row = 0; row < this.dim; row++){
            this.cells[row] = [];
            for(let col = 0; col < this.dim; col++){
                this.cells[row][col] = new MyCell(this.scene, row, col, this.div, row*this.dim + col + 1);
            }
        }
        console.log(this.dim);
        this.cells[this.dim-1][0].changeState(0);
        this.cells[0][this.dim-1].changeState(1);
    }

    display(){        
        this.scene.pushMatrix();
        this.scene.translate(-this.dim/2, 0, -this.dim/2);
        this.scene.translate(0.5, 0, 0.5);

        // draw objects
        for(let row = 0; row < this.dim; row++){
            for(let col = 0; col < this.dim; col++){
                this.cells[row][col].display();
            }
        }
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.material.apply();
        this.scene.translate(0, -0.01, 0);
        this.scene.scale(this.dim/2, 1, this.dim/2);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.quad.display();
        this.scene.popMatrix();
    }


    updateCoords(s, t){
    }

    toString(){
        //Not working yet
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

    movePieceToCell(row, col, player){
        this.cells[row -1 ][col -1].changeState(player);
    }

    revertStateAt(row, col){
        console.log(parseInt(row) - 1);
        return this.cells[parseInt(row) - 1][parseInt(col) - 1].revertState();
    }
}