class MyCylinder2{
    
    constructor(scene, base, top, height, slices, stacks){
        this.scene = scene;
        this.height = height;
        this.base = base;
        this.top = top;
        this.slices = slices;
        this.stacks = stacks;

        this.cylinder = this.createNurb();

    }


    createNurb(){
        let v = Math.sin(Math.PI/4);

        let t = this.top;
        let b = this.base;
        let h = this.height;

		let controlvertexes = [
				[ [0, b, 0, 1],     [0, t, h, 1] ],
				[ [-b, b, 0, v],     [-t, t, h, v] ],
				[ [-b, 0, 0, 1],    [-t, 0, h, 1] ],
				[ [-b, -b, 0, v],   [-t, -t, h, v] ],
				[ [0, -b, 0, 1],    [0, -t, h, 1] ],
				[ [b, -b, 0, v],    [t, -t, h, v] ],
				[ [b, 0, 0, 1],     [t, 0, h, 1] ],
				[ [b, b, 0, v],     [t, t, h, v] ],
				[ [0, b, 0, 1],     [0, t, h, 1] ]
			]


        let degreeU = 8;
        let degreeV = 1;

		let nurbsSurface = new CGFnurbsSurface(degreeU, degreeV, controlvertexes);
        let obj = new CGFnurbsObject(this.scene, this.slices, this.stacks, nurbsSurface);

        return obj;
    }


    display(){
        this.cylinder.display();
    }

}