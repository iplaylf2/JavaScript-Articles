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
    Environment.Global.defineFunction(
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
        { parameterList: ['start'], functionName: 'getCounter' }));
Environment.Global.defineVariable('counter');
Environment.Global.setVariable('counter', Environment.Global.getVariable('getCounter')(0));
Environment.Global.getVariable('counter')();