class Environment {
    constructor(theEnvironment) {
        this.environmentPointer = theEnvironment;
        this.bindingContainer = {};
    }
    defineVariable(name) {
        this.bindingContainer[name] = null;
    }
    findBindingContainer(name) {
        if (this.bindingContainer.hasOwnProperty(name)) {
            return this.bindingContainer;
        } else {
            if (this.environmentPointer === Environment.End) {
                throw `not found variable '${name}'`;
            } else {
                return this.environmentPointer.findBindingContainer(name);
            }
        }
    }
    getVariable(name) {
        var bindingContainer = this.findBindingContainer(name);
        return bindingContainer[name];
    }
    setVariable(name, value) {
        var bindingContainer = this.findBindingContainer(name);
        bindingContainer[name] = value;
    }
    defineFunction(func, parameterList = [], variableSet = []) {
        var theEnvironment = this;
        return function (...args) {
            var environment = new Environment(theEnvironment);
            for (var name of parameterList) {
                environment.defineVariable(name);
            }
            for (var name of variableSet) {
                environment.defineVariable(name);
            }
            for (var i = 0; i !== args.length && i !== parameterList.length; i++) {
                environment.setVariable(parameterList[i], args[i]);
            }
            return func.call(this, environment);
        };
    }
}
Environment.End = {};
Environment.Global = new Environment(Environment.End);
Environment.Global.bindingContainer = this;