class MyPlane extends CGFobject {

    constructor(scene, bottomLeftX, bottomLeftY, topRightX, topRightY) {
        super(scene);

        this.patchLength = 1;

        this.bottomLeftX = bottomLeftX;
        this.bottomLeftY = bottomLeftY;
        this.topRightX = topRightX;
        this.topRightY = topRightY;

        this.dx = this.topRightX - this.bottomLeftX;
        this.dy = this.topRightY - this.bottomLeftY;

        this.nrDivsX = this.dx / this.patchLength;
        this.nrDivsY = this.dy / this.patchLength;

        this.ds = 1 / this.nrDivsX;
        this.dt = 1 / this.nrDivsY;

        
        this.vertices = [];
        this.normals = [];
        this.texCoords = [];


        this.initBuffers();
    };

    updateCoords(s, t) {
        let sRatio = this.dx / s;
        let tRatio = this.dy / t;

        for (let i = 0; i < this.texCoords.length; i += 2) {
            this.texCoords[i] = this.originaltexCoords[i] * sRatio;
            this.texCoords[i + 1] = this.originaltexCoords[i + 1] * tRatio;
        }

        this.updateTexCoordsGLBuffers();
    }

    initBuffers() {
        // Generate vertices and normals

        let yCoord = this.topRightY;

        for (let j = 0; j <= this.nrDivsY; j++) {
            let xCoord = this.bottomLeftX;
            for (let i = 0; i <= this.nrDivsX; i++) {
                this.vertices.push(xCoord, yCoord, 0);
                this.normals.push(0, 0, 1);

                this.texCoords.push(this.ds * i, this.dt * j);

                xCoord += this.patchLength;
            }
            yCoord -= this.patchLength;
        }


        this.indices = [];
        var ind = 0;


        /* Alternative with TRIANGLES instead of TRIANGLE_STRIP. More indices, but no degenerate triangles */

        for (var j = 0; j < this.nrDivsY; j++) {
            for (var i = 0; i < this.nrDivsX; i++) {
                this.indices.push(ind, ind + this.nrDivsX + 1, ind + 1);
                this.indices.push(ind + 1, ind + this.nrDivsX + 1, ind + this.nrDivsX + 2);

                ind++;
            }
            ind++;
        }

        
        this.originaltexCoords = this.texCoords.slice();
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    };

};