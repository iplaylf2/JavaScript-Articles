var getCounter = Environment.Global.defineFunction(function (environment) {
    var counter = environment.defineFunction(function (environment) {
        var result = environment.getVariable('start');
        environment.setVariable('start', result + 1);
        return result;
    });
    return counter;
}, ['start']);
var counter = getCounter(0);
counter();
counter();
counter();