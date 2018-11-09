class Environment {
    constructor(theEnvironment) {
        this.environmentPointer = theEnvironment;
        this.bindingContainer = {};
        this.name = `${Math.random().toString(36).substr(2)}`;
    }
    defineVariable(name) {
        this.bindingContainer[name] = null;
        console.log(`create binding '*${name}' in environment '\$${this.name}'`);
    }
    findBindingContainer(name) {
        if (this.bindingContainer.hasOwnProperty(name)) {
            console.log(`found binding '*${name}' in environment '\$${this.name}'`);
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
        var binding_container = this.findBindingContainer(name);
        console.log(`get variable '${name}' in environment '\$${this.name}'`);
        return binding_container[name];
    }
    setVariable(name, value) {
        var binding_container = this.findBindingContainer(name);
        binding_container[name] = value;
        console.log(`set variable '${name}' in environment '\$${this.name}'`);
    }
    defineFunction(func, parameterList = [], variableSet = []) {
        var the_environment = this;
        var proxy = function (...args) {
            var environment = new Environment(the_environment);
            console.log(`create environment '\$${environment.name}'`);
            for (var name of parameterList) {
                environment.defineVariable(name);
            }
            for (var name of variableSet) {
                environment.defineVariable(name);
            }
            for (var i = 0; i !== args.length && i !== parameterList.length; i++) {
                environment.setVariable(parameterList[i], args[i]);
            }
            console.log(`enter environment '\$${environment.name}'`);
            var result = func.call(this, environment);
            console.log(`exit environment '\$${environment.name}'`);
            return result;
        };
        console.log(`define function in environment '\$${this.name}'`);
        return proxy;
    }
}
Environment.End = {};
Environment.Global = new Environment(Environment.End);
Environment.Global.bindingContainer = this;