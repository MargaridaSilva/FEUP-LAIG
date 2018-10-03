/**
 * MyHalfSphere
 * @constructor
 */
class MySphere extends CGFobject
{
    constructor(scene, slices, stacks, minS, maxS, minT, maxT){
        super(scene);
        this.slices = slices;
        this.stacks = stacks;

        this.vertices = [];
        this.normals = [];
        this.indices = [];
        this.texCoords = [];

        this.initBuffers();
    }

    initBuffers()
    {
        var stepS = (this.maxS-this.minS)/this.slices;
        var stepT = (this.maxT-this.minT)/this.slices;

        var texS = 0;
        var texIncS = 1/this.slices;
        var texIncT = 1/this.stacks;
        var prevTexT = 0;
        var nextTexT = 0;

        var alpha = 360/this.slices;

        alpha = (alpha * Math.PI)/180;

        var radiusTop = 1;
        var botRad = 1;

        var stackHeight = 1/this.stacks;

        var sumAlpha = 0;
        var sumHeight = 0;

        for (var j = 0; j < this.stacks; j++) {

            nextTexT += texIncT;

            for (var i = j*this.slices*4; i < (j+1)*this.slices*4; i += 4) {

                radiusTop = Math.sqrt(1-(((j+1)*stackHeight)*((j+1)*stackHeight)));

                this.vertices.push(botRad*Math.cos(sumAlpha),botRad*Math.sin(sumAlpha), sumHeight);
                this.normals.push(botRad*Math.cos(sumAlpha), botRad*Math.sin(sumAlpha), 0);
                this.texCoords.push(texS, prevTexT);

                this.vertices.push(radiusTop*Math.cos(sumAlpha), radiusTop*Math.sin(sumAlpha), sumHeight+stackHeight);
                this.normals.push(radiusTop*Math.cos(sumAlpha), radiusTop*Math.sin(sumAlpha), 0);
                this.texCoords.push(texS, nextTexT);

                sumAlpha += alpha;
                texS += texIncS;

                this.vertices.push(botRad*Math.cos(sumAlpha), botRad*Math.sin(sumAlpha), sumHeight);
                this.normals.push(botRad*Math.cos(sumAlpha),botRad*Math.sin(sumAlpha), 0);
                this.texCoords.push(texS, prevTexT);

                this.vertices.push(radiusTop*Math.cos(sumAlpha), radiusTop*Math.sin(sumAlpha), sumHeight+stackHeight);
                this.normals.push(radiusTop*Math.cos(sumAlpha), radiusTop*Math.sin(sumAlpha), 0);
                this.texCoords.push(texS, nextTexT);

                this.indices.push(i + 2,i + 1,i,i + 1,i + 2,i + 3);

            }
            
            sumAlpha = 0;
            botRad = radiusTop;
            sumHeight += stackHeight;
            texS = 0;
            prevTexT = nextTexT;

        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    };
};