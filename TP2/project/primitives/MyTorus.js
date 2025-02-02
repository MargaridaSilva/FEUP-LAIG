/**
 * MyTorus
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyTorus extends CGFobject
{
	constructor(scene, inner = 2, outer = 3, slices = 100, loops = 500)
	{
        
        super(scene);

        this.outer = outer;
        this.inner = inner;
        this.slices = slices; 
        this.loops = loops;


        this.indices = [];
        this.vertices = [];
        this.normals = [];
        this.texCoords = [];

        this.initBuffers();
	};

    updateCoords(s, t){
        let sRatio = 1 / s;
        let tRatio = 1 / t;

        for (let i = 0; i < this.texCoords.length; i += 2) {
            this.texCoords[i] = this.originaltexCoords[i] * sRatio;
            this.texCoords[i + 1] = this.originaltexCoords[i + 1] * tRatio;
        }

        this.updateTexCoordsGLBuffers();
    }

	initBuffers()
	{   
        var center = {x: 0, y:0, z:0};
        var vertex = {x: 0, y:0, z:0};
        var normal = {x: 0, y:0, z:0};

        var j, i;

        // generate vertices, normals and uvs

        for ( j = 0; j <= this.loops; j ++ ) {

            var v = j / this.loops * Math.PI * 2;

            for ( i = 0; i <= this.slices; i ++ ) {

                var u = i / this.slices * Math.PI * 2;

                // vertex

                vertex.x = ( this.outer + this.inner * Math.cos( v ) ) * Math.cos( u );
                vertex.y = ( this.outer + this.inner * Math.cos( v ) ) * Math.sin( u );
                vertex.z = this.inner * Math.sin( v );

                this.vertices.push( vertex.x, vertex.y, vertex.z );

                // normal

                center.x = this.outer * Math.cos( u );
                center.y = this.outer * Math.sin( u );
                
                normal.x = vertex.x - center.x;
                normal.y = vertex.y - center.y;
                normal.z = vertex.z - center.z;

                let norm = Math.sqrt(normal.x*normal.x + normal.y*normal.y + normal.z*normal.z);

                normal.x /= norm;
                normal.y /= norm;
                normal.z /= norm;

                this.normals.push( normal.x, normal.y, normal.z );

                // uv

                this.texCoords.push( i / this.slices );
                this.texCoords.push( j / this.loops );

            }

        }

        // generate indices

        for ( j = 1; j <= this.loops; j ++ ) {

            for ( i = 1; i <= this.slices; i ++ ) {

                // indices

                var a = ( this.slices + 1 ) * j + i - 1;
                var b = ( this.slices + 1 ) * ( j - 1 ) + i - 1;
                var c = ( this.slices + 1 ) * ( j - 1 ) + i;
                var d = ( this.slices + 1 ) * j + i;

                // faces

                this.indices.push( a, b, d );
                this.indices.push( b, c, d );

            }

        }

        
        this.originaltexCoords = this.texCoords.slice();
		this.primitiveType=this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};
};