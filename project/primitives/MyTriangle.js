/**
 * MyTriangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyTriangle extends CGFobject {
    constructor(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
        super(scene);

        this.x1 = x1;
        this.y1 = y1;
        this.z1 = z1;

        this.x2 = x2;
        this.y2 = y2;
        this.z2 = z2;

        this.x3 = x3;
        this.y3 = y3;
        this.z3 = z3;


        this.a = Math.sqrt((x3 - x1) * (x3 - x1) + (y3 - y1) * (y3 - y1) + (z3 - z1) * (z3 - z1));
        this.b = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1) + (z2 - z1) * (z2 - z1));
        this.c = Math.sqrt((x3 - x2) * (x3 - x2) + (y3 - y2) * (y3 - y2) + (z3 - z2) * (z3 - z2));

        this.cos = (this.a * this.a - this.b * this.b + this.c * this.c) / (2 * this.a * this.c);
        this.sen = Math.sqrt(1 - this.cos * this.cos);

        this.initBuffers();
    };

    updateCoords(s, t) {

        let sRatio = this.c / s;
        let tRatio = 1 / t;

        for (let i = 0; i < this.texCoords.length; i += 2) {
            this.texCoords[i] = this.originaltexCoords[i] * sRatio;
            this.texCoords[i + 1] = this.originaltexCoords[i + 1] * tRatio;
          }

        this.updateTexCoordsGLBuffers();
    }

    initBuffers() {
        this.vertices = [
            this.x1, this.y1, this.z1,
            this.x2, this.y2, this.z2,
            this.x3, this.y3, this.z3
        ];

        this.indices = [
            0, 1, 2,
        ];


        let v1 = { x: this.x2 - this.x1, y: this.y2 - this.y1, z: this.z2 - this.z1 };
        let v2 = { x: this.x3 - this.x1, y: this.y3 - this.y1, z: this.z3 - this.z1 };

        let v1Xv2 = {
            x: v1.y * v2.z - v1.z * v1.y,
            y: v1.z * v2.x - v1.x * v2.z,
            z: v1.x * v2.y - v1.y * v2.x
        };

        this.normals = [
            v1Xv2.x, v1Xv2.y, v1Xv2.z,
            v1Xv2.x, v1Xv2.y, v1Xv2.z,
            v1Xv2.x, v1Xv2.y, v1Xv2.z
        ];


        this.texCoords = [
            (this.c - this.a * this.cos)/this.c, - this.a * this.sen,
            0, 0,
            1, 0
        ];

        
        this.originaltexCoords = this.texCoords.slice();
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    };
};