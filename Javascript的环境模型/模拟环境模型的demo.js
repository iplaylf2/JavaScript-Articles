var getCounter = Environment.Global.defineFunction(function ($) {
    return $.defineFunction(function ($) {
        $.setVariable('result', $.getVariable('start'));
        $.setVariable('start', $.getVariable('result') + 1);
        return $.getVariable('result');
    }, [], ['result']);
}, ['start']);
var counter = getCounter(0);
counter();
counter();
counter();