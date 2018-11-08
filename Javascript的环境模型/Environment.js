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
                throw `not found ${name}`;
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
    defineFunction(func) {
        var theEnvironment = this;
        return function (...args) {
            var environment = new Environment(theEnvironment);
            var callObject = this ? this : {};
            callObject.environment = environment;
            return func.apply(callObject, args);
        };
    }
}
Environment.End = {};
Environment.Global = new Environment(Environment.End);
Environment.Global.bindingContainer = this;