
Array.prototype.peek = function(){
    return this[this.length-1];
}


Array.prototype.normalize = function(){

    var normSqr = 0;

    for(let i = 0; i < this.length; i++){
        normSqr += this[i]*this[i];
    }

    let norm = Math.sqrt(normSqr);

    for(let i = 0; i < this.length; i++){
        this[i] /= norm;
    }

    return this;
}