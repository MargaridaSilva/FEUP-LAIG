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

        let controlvertexes = this.createControlVetexes(this.vertexList);

		let nurbsSurface = new CGFnurbsSurface(degreeU, degreeV, controlvertexes);
        let obj = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, nurbsSurface);

        return obj;
    }

    display(){
        this.patch.display();
    }

    createControlVetexes(vertexList){
        let controlvertexes = [];

        for(let i = 0; i < this.npointsU; i++){
            let lineV = [];
            for(let j = 0; j < this.npointsV; j++){
                lineV.push(vertexList[i*this.npointsV + j]);
            }  
            controlvertexes.push(lineV);
        }
        return controlvertexes;
    }

}