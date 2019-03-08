//using Environment.detail.js

// var getCounter = function (start) {
//     return function () {
//         var result = start;
//         start += 1;
//         return result;
//     };
// };
// var counter = getCounter(0);
// counter();
Environment.Global.defineVariable('getCounter');
Environment.Global.setVariable(
    'getCounter',
    Environment.Global.defineFunction(new $Function(
        function ($) {
            return $.defineFunction(new $Function(
                function ($) {
                    $.defineVariable('result');
                    $.setVariable('result', $.getVariable('start'));
                    $.setVariable('start', $.getVariable('start') + 1);
                    return $.getVariable('result');
                },
                { functionName: 'counter' }));
        },
        { parameterList: ['start'], functionName: 'getCounter' }))
);
Environment.Global.defineVariable('counter');
Environment.Global.setVariable('counter', getCounter(0));
counter();