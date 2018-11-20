class Environment {
    constructor(pointer, functionName) {
        this.environmentPointer = pointer;
        this.name = `${functionName}[${Math.random().toString(36).substr(2)}]`;
        this.bindingContainer = {};
    }
    defineVariable(name) {
        console.log(`create binding "*${name}" in environment "\$${this.name}"`);
        this.bindingContainer[name] = null;
    }
    findBindingContainer(name) {
        if (this.bindingContainer.hasOwnProperty(name)) {
            console.log(`found binding "*${name}" in environment "\$${this.name}"`);
            return this.bindingContainer;
        } else {
            if (this.environmentPointer === Environment.End) {
                throw `not found variable "${name}"`;
            } else {
                return this.environmentPointer.findBindingContainer(name);
            }
        }
    }
    getVariable(name) {
        console.log(`get variable "${name}" in environment "\$${this.name}"`);
        var binding_container = this.findBindingContainer(name);
        return binding_container[name];
    }
    setVariable(name, value) {
        console.log(`set variable "${name}" in environment "\$${this.name}"`);
        var binding_container = this.findBindingContainer(name);
        binding_container[name] = value;
    }
    defineFunction(func, { parameterList, variableSet, functionName }) {
        if (!Array.isArray(parameterList)) {
            parameterList = [];
        }
        if (!Array.isArray(variableSet)) {
            variableSet = [];
        }
        if (typeof functionName !== 'string') {
            functionName = 'anonymous';
        }
        console.log(`define function "${functionName}" in environment "\$${this.name}"`);
        var environment_pointer = this;
        var proxy = function (...args) {
            console.log(`call function "${functionName}"`);
            var environment = new Environment(environment_pointer, functionName);
            console.log(`create environment "\$${environment.name}"`);
            for (var name of parameterList) {
                environment.defineVariable(name);
            }
            for (var name of variableSet) {
                environment.defineVariable(name);
            }
            for (var i = 0; i !== args.length && i !== parameterList.length; i++) {
                environment.setVariable(parameterList[i], args[i]);
            }
            console.log(`enter environment "\$${environment.name}"`);
            var result = func.call(this, environment);
            console.log(`function "${functionName}" return`);
            console.log(`exit environment “\$${environment.name}”`);
            return result;
        };
        return proxy;
    }
}
Environment.End = {};
Environment.Global = new Environment(Environment.End, 'Global');
Environment.Global.bindingContainer = this;