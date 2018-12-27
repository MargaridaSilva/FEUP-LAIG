class MyCell extends CGFobject {

    constructor(scene, x, y, div, id){
        super(scene);
        this.pos = {x: x, y: y};
        this.state = 'empty';
        this.object = new MyPlane(scene, div, div);
        this.id = id;

    }

    setState(newState){
        this.state = newState;
    }
  
    
    display(){        
        this.piece = MyPiece.pieces[this.state];

        let x = this.pos.x;
        let y = this.pos.y;


        if((x + y) % 2){
            this.scene.graph.materials.white.apply();
        }
        else{
            this.scene.graph.materials.black.apply();
        }

        this.scene.pushMatrix();

        this.scene.translate(x, 0, y);
        this.scene.registerForPick(this.id, this.object);

        this.object.display();

        if(this.piece != undefined){
            this.piece.setId(this.id);
            this.piece.display();
        } 
        this.scene.popMatrix();

    }

    toString(){
        return `cell(${this.pos.x}, ${this.pos.y}, ${this.state})`;
    }

    updateCoords(s, t){
    }

    handlePicking(pickedElements){


        for(let i = 0; i < pickedElements.length; i++){
            let element = pickedElements[i];
            let id = element[1];

            if(id == this.id){
                console.log("Change state");
                if(this.state == 'empty')
                    this.state = 'bAliv';
                else{
                    this.state = 'empty';
                }
                
            }
        }

    }
}