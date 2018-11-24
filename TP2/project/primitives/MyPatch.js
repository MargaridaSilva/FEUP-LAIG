class MyPatch extends CGFobject{
    
    constructor(scene, npointsU, npointsV, npartsU, npartsV, vertexList){
        super(scene);
        this.scene = scene;
        this.npointsU = npointsU;
        this.npointsV = npointsV;
        this.npartsU = npartsU;
        this.npartsV = npartsV;
        this.vertexList = vertexList;

        this.patch = this.createNurb();
    }

    createNurb(){
        let degreeU = this.npointsU - 1;
        let degreeV = this.npointsV - 1;

        let controlvertexes = this.createControlVertexes(this.vertexList);

		let nurbsSurface = new CGFnurbsSurface(degreeU, degreeV, controlvertexes);
        let obj = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, nurbsSurface);

        return obj;
    }

    display(){
        this.patch.display();
    }

    createControlVertexes(vertexList){
        let controlvertexes = [];
        let index = 0;

        for(let i = 0; i < this.npointsU; i++){
            let lineV = [];
            for(let j = 0; j < this.npointsV; j++){
                let controlPoint = [];
                for(let k = 0; k < 3; k++){
                    controlPoint.push(vertexList[index]);
                    index++;
                }
                controlPoint.push(1);
                lineV.push(controlPoint);
            } 
            controlvertexes.push(lineV);
        }
        return controlvertexes;
    }

}