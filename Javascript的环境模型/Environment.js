const Environment = (global => {
    class Environment {
        constructor(pointer, functionName) {
            this.environmentPointer = pointer;
            this.name = `${functionName}[${Math.random().toString(36).substr(2)}]`;
            this.bindingContainer = {};
        }
        defineVariable(name) {
            console.info(`定义变量${name}并创建绑定。`);
            this.bindingContainer[name] = null;
        }
        findBindingContainer(variable_name) {
            console.info(`查找绑定*${variable_name}。`)
            if (this.bindingContainer.hasOwnProperty(variable_name)) {
                console.info('找到了绑定。');
                return this.bindingContainer;
            } else {
                console.info('在该环境中找不到绑定。');
                if (this.environmentPointer === Environment.End) {
                    console.info('环境引用走向了尽头。');
                    throw '不存在对应的绑定。';
                } else {
                    console.info(`通过环境引用在环境\$${this.name}中查找绑定。`);
                    return this.environmentPointer.findBindingContainer(variable_name);
                }
            }
        }
        getVariable(name) {
            console.info(`使用变量${name}。`);
            const binding_container = this.findBindingContainer(name);
            const value = binding_container[name];
            console.info(`获得变量${name}的值：`);
            console.dir(value);
            return value;
        }
        setVariable(name, value) {
            console.info(`使用变量${name}。`);
            const binding_container = this.findBindingContainer(name);
            binding_container[name] = value;
            console.info(`给变量${name}赋值：`);
            console.dir(value);
        }
        defineFunction($func) {
            $func.saveEnvironmentPointer(this);
            var func = $func.get$call();
            return func;
        }
    }
    Environment.End = null;
    Environment.Global = new Environment(Environment.End, 'Global');
    Environment.Global.bindingContainer = global;
    return Environment;
})(window);

const $Function = (() => {
    class $Function {
        constructor(func, { parameterList, functionName }) {
            console.info(`定义函数${functionName}。`);
            if (!Array.isArray(parameterList)) {
                parameterList = [];
            }
            if (typeof functionName !== 'string') {
                functionName = 'anonymous';
            }
            this.real = func;
            this.parameterList = parameterList;
            this.functionName = functionName;
        }
        saveEnvironmentPointer(environmentPointer) {
            this.environmentPointer = environmentPointer;
            console.info(`函数${this.functionName}保存了环境\$${environmentPointer.name}的引用。`);
        }
        $call(...args) {
            const func = this.real;
            const parameterList = this.parameterList;
            const functionName = this.functionName;
            console.info(`调用函数${functionName}。`);
            const new_environment = new Environment(this.environmentPointer, functionName);
            console.info(`创建环境\$${new_environment.name}。`);
            for (var name of parameterList) {
                new_environment.bindingContainer[name] = null;
            }
            console.info(`为环境\$${new_environment.name}生成绑定：${parameterList.map(name => `*${name}`).join()}。`);
            for (var i = 0; i !== parameterList.length; i++) {
                new_environment.bindingContainer[parameterList[i]] = args[i];
                console.info(`给变量${parameterList[i]}赋值：`);
                console.dir(args[i]);
            }
            console.info(`进入环境\$${new_environment.name}。`);
            const result = func(new_environment);
            console.info(`函数${functionName}返回：`);
            console.dir(result);
            console.info(`退出环境\$${new_environment.name}。`);
            return result;
        }
        get$call() {
            return this.$call.bind(this);
        }
    }
    return $Function;
})();