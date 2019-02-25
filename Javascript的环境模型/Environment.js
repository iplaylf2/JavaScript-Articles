class Environment {
    constructor(pointer, functionName) {
        this.environmentPointer = pointer;
        this.name = `${functionName}[${Math.random().toString(36).substr(2)}]`;
        this.bindingContainer = {};
    }
    findBindingContainer(variable_name) {
        console.info(`在环境\$${this.name}中查找变量绑定*${variable_name}。`)
        if (this.bindingContainer.hasOwnProperty(variable_name)) {
            console.info('找到了变量绑定。');
            return this.bindingContainer;
        } else {
            console.info('找不到变量绑定。');
            if (this.environmentPointer === Environment.End) {
                console.info('环境引用走向了尽头。');
                throw `不存在对应的绑定。`;
            } else {
                console.info('通过环境引用在其他环境查找绑定。');
                return this.environmentPointer.findBindingContainer(variable_name);
            }
        }
    }
    getVariable(name) {
        console.info(`使用变量${name}。`);
        var binding_container = this.findBindingContainer(name);
        var value = binding_container[name];
        console.info(`获得变量${name}的值：`);
        console.dir(value);
        return value;
    }
    setVariable(name, value) {
        console.info(`使用变量${name}。`);
        var binding_container = this.findBindingContainer(name);
        binding_container[name] = value;
        console.info(`给变量${name}赋值：`);
        console.dir(value);
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
        console.info(`定义函数${functionName}。`);
        var environment_pointer = this;
        var proxy = function (...args) {
            console.info(`调用函数${functionName}。`);
            var new_environment = new Environment(environment_pointer, functionName);
            console.info(`创建环境\$${new_environment.name}。`);
            var all_variable = parameterList.concat(variableSet);
            for (var name of all_variable) {
                new_environment.bindingContainer[name] = null;
            }
            console.info(`为环境\$${new_environment.name}生成绑定：${all_variable.map(name => `*${name}`).join()}。`);
            for (var i = 0; i !== parameterList.length; i++) {
                new_environment.bindingContainer[parameterList[i]] = args[i];
                console.info(`给变量${parameterList[i]}赋值：`);
                console.dir(args[i]);
            }
            console.info(`进入环境\$${new_environment.name}。`);
            var result = func.call(this, new_environment);
            console.info(`函数${functionName}返回：`);
            console.dir(result);
            console.info(`退出环境\$${new_environment.name}。`);
            return result;
        };
        console.info(`函数${functionName}保存了环境\$${this.name}的引用。`);
        return proxy;
    }
}
Environment.End = {};
Environment.Global = new Environment(Environment.End, 'Global');
Environment.Global.bindingContainer = this;
Environment.Global.defineVariable = function (name) {
    console.info(`在环境\$${this.name}中定义变量${name}。`);
    this.bindingContainer[name] = null;
};