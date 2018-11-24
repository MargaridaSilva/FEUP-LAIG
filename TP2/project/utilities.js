
Array.prototype.peek = function () {
    return this[this.length - 1];
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

isPowerOfTwo = function(x)
{
    return (x & (x - 1)) == 0;
}

const SEC_TO_MSEC = 1000;
const DEG_TO_RAD = Math.PI/180;

Array.prototype.norm = function () {

    var normSqr = 0;

    for (let i = 0; i < this.length; i++) {
        normSqr += this[i] * this[i];
    }

    let norm = Math.sqrt(normSqr);
    return norm;
}


Array.prototype.minus = function (array2) {

    if(this.size != array2.size) return undefined;

    let x = this.map(function (item, index) {
        return item - array2[index];
    })
    return x;
}


Array.prototype.add = function (array2) {

    if(this.size != array2.size) return undefined;

    let x = this.map(function (item, index) {
        return item + array2[index];
    })
    return x;
}


Array.prototype.div = function (constant) {

    let x = this.map(function (item) {
        return item / constant;
    })
    return x;
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