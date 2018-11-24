class MyCylinder2 extends CGFobject{
    
    constructor(scene, base, top, height, slices, stacks){
        super(scene);
        this.height = height;
        this.base = base;
        this.top = top;
        this.slices = slices;
        this.stacks = stacks;

        this.cylinderTop = this.createCylinderTop();
        this.cylindeBottom = this.createCylinderBottom();

    }


    createCylinderTop(){
        let t = this.top;
        let b = this.base;
        let h = this.height;

        let controlvertexes = [
            [ [t, 0, 0, 1], [b, 0, h, 1] ],
            [ [t, t, 0, 1/3], [b, b, h, 1/3] ],
            [ [-t, t, 0, 1/3], [-b, b, h, 1/3] ],
            [ [-t, 0, 0, 1], [-b, 0, h, 1] ]
        ];

        let degreeU = 3;
        let degreeV = 1;

		let nurbsSurface = new CGFnurbsSurface(degreeU, degreeV, controlvertexes);
        let obj = new CGFnurbsObject(this.scene, this.slices, this.stacks, nurbsSurface);

        return obj;
    }

    createCylinderBottom(){
        let t = this.top;
        let b = this.base;
        let h = this.height;

        let controlvertexes = [
            [ [-t, 0, 0, 1], [-b, 0, h, 1] ],
            [ [-t, -t, 0, 1/3], [-b, -b, h, 1/3] ],
            [ [t, -t, 0, 1/3], [b, -b, h, 1/3] ],
            [ [t, 0, 0, 1], [b, 0, h, 1] ]
        ];

        let degreeU = 3;
        let degreeV = 1;

		let nurbsSurface = new CGFnurbsSurface(degreeU, degreeV, controlvertexes);
        let obj = new CGFnurbsObject(this.scene, this.slices, this.stacks, nurbsSurface);

        return obj;
    }

    display(){
        this.cylinderTop.display();
        this.cylindeBottom.display();
    }

    updateCoords(){
        
    }

}