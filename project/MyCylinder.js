/**
 * MyCylinder
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyCylinder extends CGFobject {
  constructor(scene, base, top, height, slices, stacks) {
    super(scene);

    //N Arestas base
    this.base = base;
    this.top = top;
    this.height = height;
    this.slices = slices;
    this.stacks = stacks;

    this.indices = [];
    this.vertices = [];
    this.normals = [];
    this.texCoords = [];

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

        var radius = v * (this.base - this.top) + this.top;

        // vertex
        let vertex = [];
        vertex.x = radius * sinTheta;
        vertex.y = radius * cosTheta;
        vertex.z = v*this.height;
        this.vertices.push(vertex.x, vertex.y, vertex.z);

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

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  };



  updateCoords(s, t) {
    //   let sRatio = this.maxS / s;
    //   let tRatio = this.maxT / t;

    //   for (let i = 0; i < this.texCoords.length; i += 2) {
    //     this.texCoords[i] *= sRatio;
    //     this.texCoords[i + 1] *= tRatio;
    //   }

    //   this.updateTexCoordsGLBuffers();

    //   for (let i = 0; i < this.texCoords.length; i += 2) {
    //     this.texCoords[i] /= sRatio;
    //     this.texCoords[i + 1] /= tRatio;
    //   }
  }
};