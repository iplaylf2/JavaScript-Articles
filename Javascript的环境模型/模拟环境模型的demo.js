// var getCounter = function (start) {
//     return function () {
//         var result = start;
//         start += 1;
//         return result;
//     };
// };
var getCounter = Environment.Global.defineFunction(
    function ($) {
        return $.defineFunction(
            function ($) {
                $.setVariable('result', $.getVariable('start'));
                $.setVariable('start', $.getVariable('start') + 1);
                return $.getVariable('result');
            },
            { variableSet: ['result'], functionName: 'counter' }
        );
    },
    { parameterList: ['start'], functionName: 'getCounter' });
var counter = getCounter(0);
counter();
counter();
counter();