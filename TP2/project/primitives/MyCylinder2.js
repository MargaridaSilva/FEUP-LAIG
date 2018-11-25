/**
 * MyCylinder2
 * @constructor
 */
class MyCylinder2 extends CGFobject{
    /**
     * 
     * @param {CGFscene} scene the scene where it will be
     * @param {Number} base the radius of the cylinder's base
     * @param {Number} top the radius of the cylinder's top
     * @param {Number} height the height of the cylinder
     * @param {Number} slices number of angle divisions at x0y plane
     * @param {Number} stacks number of divisions at zz axis
     */
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

    /**
     * Creates cylinders top control points and a NURB with them
     */
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

    /**
     * Creates cylinders bottom control points and a NURB with them
     */

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

    /**
     * Displays cylinder (both top and bottom NURBS)
     */
    
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