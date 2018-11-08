function add10(value) { //1
    var increment = 10; //2
    return value + increment;   //3
}   //4
add10(2);   //5

function main() {   //1
    var x = 10; //2
    var addX = function (value) {   //3
        var increment = x;  //4
        return value + increment;   //5
    };  //6

    var value = 2;  //7
    addX(value);    //8
}   //9
main(); //10

var getCounter = function (start) { //1
    return function () {    //2
        return start++; //3
    };  //4
};  //5
var counter = getCounter(0);    //6
counter();  //7
counter();  //8
counter();  //9