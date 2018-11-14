class MyVehicle extends CGFobject {

    constructor(scene){
        super(scene);
        this.vehicle = this.createNurb();
    }

    createNurb(){
        let controlvertexes = [
            [ [1, 2, 3, 4], [5, 6, 7, 8] ],
            [ [2, 3, 4, 5], [6, 7, 8, 9] ],
            [ [3, 4, 5, 6], [7, 8, 9, 10] ],
            [ [4, 5, 6, 7], [8, 9, 10, 11] ]
        ]


    let degreeU = controlvertexes.length - 1;
    let degreeV = controlvertexes[0].length -1;

    let nurbsSurface = new CGFnurbsSurface(degreeU, degreeV, controlvertexes);
    let obj = new CGFnurbsObject(this.scene, this.slices, this.stacks, nurbsSurface);
    return obj;
    }

    updateCoords(){

    }

    display(){
        this.vehicle.display();
    }
};