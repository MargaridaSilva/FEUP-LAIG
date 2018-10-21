/**
 * MySphere
 * @constructor
 */
class MySphere extends CGFobject {
    constructor(scene, radius, slices, stacks) {
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

    updateCoords(s, t) {
        let sRatio = 1 / s;
        let tRatio = 1 / t;

        for (let i = 0; i < this.texCoords.length; i += 2) {
            this.texCoords[i] = this.originaltexCoords[i] * sRatio;
            this.texCoords[i + 1] = this.originaltexCoords[i + 1] * tRatio;
        }

        this.updateTexCoordsGLBuffers();
    }

    initBuffers() {

        for (let iy = 0; iy <= this.stacks; iy++) {

            let v = iy / this.stacks;
            let phi = v * Math.PI;

            for (let ix = 0; ix <= this.slices; ix++) {

                let u = ix / this.slices;
                let teta = u * 2 * Math.PI;


                // vertex
                let vertex = [];
                vertex.x = this.radius * Math.cos(teta) * Math.sin(phi);
                vertex.y = this.radius * Math.sin(teta) * Math.sin(phi);
                vertex.z = this.radius * Math.cos(phi);

                this.vertices.push(vertex.x, vertex.y, vertex.z);


                // normal
                let normal = vertex.normalize();
                this.normals.push(normal.x, normal.y, normal.z);


                // texCoords
                this.texCoords.push(u, v);
            }
        }


        for (let iy = 0; iy < this.stacks; iy++) {

            for (let ix = 0; ix < this.slices; ix++) {

                // indices
                var a = iy * (this.slices + 1) + ix + 1;
                var b = iy * (this.slices + 1) + ix;
                var c = (iy + 1) * (this.slices + 1) + ix;
                var d = (iy + 1) * (this.slices + 1) + (ix + 1);

                if (iy != 0) this.indices.push(a, b, d);
                if (iy != this.stacks - 1) this.indices.push(b, c, d);

            }
        }


        this.originaltexCoords = this.texCoords.slice();
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    };
};