class MyVehicle extends CGFobject {

    constructor(scene){
        super(scene);
        this.vehicle = this.createNurb();
    }

    createNurb(){
       
       let controlvertexes =
       [	this.cicleVector(0.5, 0, 0),
            this.cicleVector(1, 1, 0)
       ]

    let degreeU = controlvertexes.length -1;
    let degreeV = controlvertexes[0].length -1;

    let nurbsSurface = new CGFnurbsSurface(degreeU, degreeV, controlvertexes);
    let obj = new CGFnurbsObject(this.scene, 20, 20, nurbsSurface);
    return obj;
    }

    updateCoords(){

    }

    display(){
        this.vehicle.display();
    }

    cicleVector(radius, z, center) {
        let v = Math.sin(Math.PI/4);

        

        let points = [
            [-radius*v, 0 + center, z, 1],
            [-radius*v, radius*v + center, z, 3*v],
            [0, radius, z + center, 5],
            [radius*v, radius*v + center, z, 10*v],
            [radius, 0 + center, z, 10],
            [radius*v, -radius*v + center, z, 10*v],
            [0, -radius + center, z, 5],
            [-radius*v, -radius*v + center, z, 3*v],
            [-radius*v, 0 + center, z, 1],
        ];

        
        return points;
    }
};