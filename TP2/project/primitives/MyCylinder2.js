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
        
        this.baseCover = new MyCylinderBase(scene, slices, this.base);
        this.topCover = new MyCylinderBase(scene, slices, this.top);

    }


    createCylinderTop(){
        let t = this.top;
        let b = this.base;
        let h = this.height;


        let controlvertexes = [
            [ [b, 0, 0, 1], [t, 0, h, 1] ],
            [ [b, 2*b, 0, 1/3], [t, 2*t, h, 1/3] ],
            [ [-b, 2*b, 0, 1/3], [-t, 2*t, h, 1/3] ],
            [ [-b, 0, 0, 1], [-t, 0, h, 1] ]
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
            [ [-b, 0, 0, 1], [-t, 0, h, 1] ],
            [ [-b, -2*b, 0, 1/3], [-t, -2*t, h, 1/3] ],
            [ [b, -2*b, 0, 1/3], [t, -2*t, h, 1/3] ],
            [ [b, 0, 0, 1], [t, 0, h, 1] ]
        ];

        let degreeU = 3;
        let degreeV = 1;

		let nurbsSurface = new CGFnurbsSurface(degreeU, degreeV, controlvertexes);
        let obj = new CGFnurbsObject(this.scene, this.slices, this.stacks, nurbsSurface);

        return obj;
    }

    display(){
        this.baseCover.display();
        this.cylinderTop.display();
        this.cylindeBottom.display();

        this.scene.translate(0, 0, this.height);
        this.topCover.display();
    }

    updateCoords(){
        
    }

}