
Array.prototype.peek = function () {
    return this[this.length - 1];
}


Array.prototype.normalize = function () {

    var normSqr = 0;

    for (let i = 0; i < this.length; i++) {
        normSqr += this[i] * this[i];
    }

    let norm = Math.sqrt(normSqr);

    for (let i = 0; i < this.length; i++) {
        this[i] /= norm;
    }

    return this;
}

Array.prototype.merge = function (arr1, arr2) {
    var ret = [];

    for (var key in arr1) {
        if (arr1.hasOwnProperty(key)) {
            ret[key] = arr1[key];
        }
    }

    for (var key in arr2) {
        if (arr2.hasOwnProperty(key)) {
            ret[key] = arr2[key];
        }
    }
    return ret;
}