/**
 * MyHalfSphere
 * @constructor
 */
class MySphere extends CGFobject {
    constructor(scene, radius, slices, stacks, minS = 0, maxS = 1, minT = 0, maxT = 1) {
        super(scene);
        this.radius = radius;
        this.slices = slices;
        this.stacks = stacks;

        this.vertices = [];
        this.normals = [];
        this.indices = [];
        this.texCoords = [];

        this.initBuffers();
    }
    setS(maxS){
		this.maxS = maxS;
	}

	setT(maxT){
		this.maxT = maxT;
    }
    
    initBuffers() {


	var index = 0;
	var grid = [];

        for (let iy = 0; iy <= this.stacks; iy++) {

            var verticesRow = [];

            let v = iy / this.stacks;
            let phi = v * Math.PI;

            for (let ix = 0; ix <= this.slices; ix++) {

                let u = ix / this.slices;
                let teta = u * 2 * Math.PI;


                // vertex

                let vertexX = - this.radius * Math.cos(teta) * Math.sin(phi);
                let vertexY = this.radius * Math.cos(phi);
                let vertexZ = this.radius * Math.sin(teta) * Math.sin(phi);

                
                this.vertices.push(vertexX, vertexY, vertexZ);

                // normal
                let norm = Math.sqrt(vertexX * vertexX + vertexY * vertexY + vertexZ * vertexZ);
                this.normals.push(vertexX / norm, vertexY / norm, vertexZ / norm);

                console.log(this.normals);



                // texCoords
                this.texCoords.push(u, 1 - v);
                
                verticesRow.push( index ++ );

            }
    
            grid.push( verticesRow );
        }


        for (let iy = 0; iy < this.stacks; iy++) {

            for (let ix = 0; ix < this.slices; ix++) {

                // indices
                var a = iy * (this.slices + 1) + ix + 1;
                var b = iy * (this.slices + 1) + ix;
                var c = (iy + 1) * (this.slices + 1) + ix;
                var d = (iy + 1) * (this.slices + 1) + (ix + 1);

                if ( iy != 0) this.indices.push( a, b, d );
                if ( iy != this.stacks - 1) this.indices.push( b, c, d );

            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    };
};