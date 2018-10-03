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

        this.inner = inner;
        this.tube_radious = (outer-inner)/2;
        this.slices = slices; 
        this.loops = loops;


        this.indices = [];
        this.vertices = [];
        this.normals = [];
        this.texCoords = [];

        this.initBuffers();
	};

	initBuffers()
	{   
        var center = {x: 0, y:0, z:0};
        var vertex = {x: 0, y:0, z:0};
        var normal = {x: 0, y:0, z:0};

        var j, i;

        // generate vertices, normals and uvs

        for ( j = 0; j <= this.slices; j ++ ) {

            for ( i = 0; i <= this.loops; i ++ ) {

                var u = i / this.loops * Math.PI * 2;
                var v = j / this.slices * Math.PI * 2;

                // vertex

                vertex.x = ( this.inner + this.tube_radious * Math.cos( v ) ) * Math.cos( u );
                vertex.y = ( this.inner + this.tube_radious * Math.cos( v ) ) * Math.sin( u );
                vertex.z = this.tube_radious * Math.sin( v );

                this.vertices.push( vertex.x, vertex.y, vertex.z );

                // normal

                center.x = this.inner * Math.cos( u );
                center.y = this.inner * Math.sin( u );
                
                normal.x = vertex.x - center.x;
                normal.y = vertex.y - center.y;
                normal.z = vertex.z - center.z;

                let norm = Math.sqrt(normal.x*normal.x + normal.y*normal.y + normal.z*normal.z);

                normal.x /= norm;
                normal.y /= norm;
                normal.z /= norm;

                this.normals.push( normal.x, normal.y, normal.z );

                // uv

                this.texCoords.push( i / this.loops );
                this.texCoords.push( j / this.slices );

            }

        }

        // generate indices

        for ( j = 1; j <= this.slices; j ++ ) {

            for ( i = 1; i <= this.loops; i ++ ) {

                // indices

                var a = ( this.loops + 1 ) * j + i - 1;
                var b = ( this.loops + 1 ) * ( j - 1 ) + i - 1;
                var c = ( this.loops + 1 ) * ( j - 1 ) + i;
                var d = ( this.loops + 1 ) * j + i;

                // faces

                this.indices.push( a, b, d );
                this.indices.push( b, c, d );

            }

        }

		this.primitiveType=this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};
};