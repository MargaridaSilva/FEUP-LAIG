/**
 * MyCylinderLateral
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyCylinderLateral extends CGFobject {
  constructor(scene, base, top, height, slices, stacks) {
    super(scene);

    this.base = base;
    this.top = top;
    this.height = height;
    this.slices = slices;
    this.stacks = stacks;

    this.indices = [];
    this.vertices = [];
    this.normals = [];
    this.texCoords = [];
    this.originaltexCoords = [];

    this.initBuffers();
  };

  initBuffers() {

    var slope = (this.base - this.top) / this.height;

    for (let i = 0; i <= this.slices; i++) {

      var u = i / this.slices;
      var theta = u * 2 * Math.PI;
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);

      for (let j = 0; j <= this.stacks; j++) {

        var v = j / this.stacks;

        var radius = v * (this.top - this.base) + this.base;

        // vertex
        let vertex = [radius * sinTheta, radius * cosTheta, v * this.height];
        this.vertices.push(vertex[0], vertex[1], vertex[2]);

        // normal
        let normal = [sinTheta, cosTheta, slope].normalize();
        this.normals.push(normal[0], normal[1], normal[2]);

        // texCoords
        this.texCoords.push(1 - u, 1 - v);
      }
    }

    // index
    for (let i = 0; i < this.slices; i++) {
      for (let j = 0; j < this.stacks; j++) {

        var v1 = (this.stacks + 1) * i + j;
        var v2 = (this.stacks + 1) * i + (j + 1);
        var v3 = (this.stacks + 1) * (i + 1) + (j + 1);
        var v4 = (this.stacks + 1) * (i + 1) + j;

        this.indices.push(v1, v2, v4);
        this.indices.push(v2, v3, v4);
      }
    }

    this.originaltexCoords = this.texCoords.slice();
    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  };



  updateCoords(s, t) {

    let sRatio = 1 / s;
    let tRatio = 1 / t;

    for (let i = 0; i < this.texCoords.length; i += 2) {
      this.texCoords[i] = this.originaltexCoords[i] * sRatio;
      this.texCoords[i + 1] = this.originaltexCoords[i + 1] * tRatio;
    }

    this.updateTexCoordsGLBuffers();
  }
};