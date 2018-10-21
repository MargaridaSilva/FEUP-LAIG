class MyCylinderBase extends CGFobject {
    constructor(scene, slices, radius) {
        super(scene)
        this.slices = slices;
        this.radius = radius;

        this.indices = [];
        this.vertices = [];
        this.normals = [];
        this.texCoords = [];
        this.originaltexCoords = [];
        this.initBuffers();
    }

    initBuffers() {

        this.vertices.push(0, 0, 0);
        this.normals.push(0, 0, 1);
        this.texCoords.push(0.5, 0.5);

        for (var i = 0; i < this.slices; i++) {
            this.vertices.push(Math.cos(i * (2 * Math.PI) / this.slices) * this.radius);
            this.vertices.push(Math.sin(i * (2 * Math.PI) / this.slices) * this.radius);
            this.vertices.push(0);

            this.normals.push(0);
            this.normals.push(0);
            this.normals.push(1);

            this.texCoords.push(0.5 + Math.cos(i * (2 * Math.PI) / this.slices) / 2);
            this.texCoords.push(0.5 - Math.sin(i * (2 * Math.PI) / this.slices) / 2);
        }


        for (var i = 0; i < this.slices; i++) {

            if (i == this.slices - 1) {
                this.indices.push(0);
                this.indices.push(i + 1);
                this.indices.push(1);

                this.indices.push(i + 1);
                this.indices.push(0);
                this.indices.push(1);
            }
            else {
                this.indices.push(0);
                this.indices.push(i + 1);
                this.indices.push(i + 2);

                this.indices.push(i + 1);
                this.indices.push(0)
                this.indices.push(i + 2);
            }
        }
        
        this.originaltexCoords = this.texCoords.slice();
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
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
}