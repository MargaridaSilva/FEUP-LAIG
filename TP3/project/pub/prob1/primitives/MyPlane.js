class MyPlane extends CGFobject{
    
    constructor(scene, npartsU, npartsV){
        super(scene);
        this.scene = scene;
        this.npartsU = npartsU;
        this.npartsV = npartsV;

        this.plane = this.createNurb();
    }

    createNurb(){

        let degreeU = 1;
        let degreeV = 1;

		let controlvertexes = [
                [ [-0.5, 0, 0.5, 1],     [-0.5, 0, -0.5, 1] ],
                [ [+0.5, 0, 0.5, 1],     [+0.5, 0, -0.5, 1] ]
			]

		let nurbsSurface = new CGFnurbsSurface(degreeU, degreeV, controlvertexes);
        let obj = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, nurbsSurface);

        return obj;
    }

    updateCoords(s, t){

    }


    display(){
        this.plane.display();
    }

}