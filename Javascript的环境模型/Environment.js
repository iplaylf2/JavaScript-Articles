const Environment = (global => {
    class Environment {
        constructor(pointer) {
            this.environmentPointer = pointer;
            this.bindingContainer = {};
        }
        //变量定义
        defineVariable(name) {
            this.bindingContainer[name] = null;
        }
        //变量取值
        getVariable(name) {
            const binding_container = this.findBindingContainer(name);
            const value = binding_container[name];
            return value;
        }
        //变量赋值
        setVariable(name, value) {
            const binding_container = this.findBindingContainer(name);
            binding_container[name] = value;
        }
        //函数定义
        defineFunction(proxy) {
            proxy.saveEnvironmentPointer(this);
            const func = proxy.getCall();
            return func;
        }
        //查找绑定，返回容器
        findBindingContainer(variable_name) {
            //判断当前环境是否存在绑定。
            if (this.bindingContainer.hasOwnProperty(variable_name)) {
                //找到了绑定，返回绑定的容器。
                return this.bindingContainer;
            } else {
                //在该环境中找不到绑定。
                //判断引用是否达到了尽头。
                if (this.environmentPointer === Environment.End) {
                    //环境引用走到了尽头，抛出异常。
                    throw '不存在对应的绑定。';
                } else {
                    //通过环境引用在上一层环境中查找绑定。
                    return this.environmentPointer.findBindingContainer(variable_name);
                }
            }
        }
    }
    Environment.End = null;
    //全局环境中的环境引用只能是Environment.End了。
    Environment.Global = new Environment(Environment.End);
    //通过global可以访问全局变量，因此global作为全局环境的容器。
    Environment.Global.bindingContainer = global;
    return Environment;
})(window);

class $Function {
    constructor($func, parameterList = []) {
        this.$func = $func;
        this.parameterList = parameterList;
    }
    saveEnvironmentPointer(environmentPointer) {
        this.environmentPointer = environmentPointer;
    }
    getCall() {
        return this.call.bind(this);
    }
    call(...args) {
        //创建新的环境，并传入上一层环境的引用。
        const new_environment = new Environment(this.environmentPointer);
        //根据形参列表初始化新环境的绑定。
        for (const [i, name] of this.parameterList.entries()) {
            new_environment.bindingContainer[name] = args[i];
        }
        //将新环境作为参数传入使用模拟环境的函数并调用之。
        const result = this.$func(new_environment);
        return result;
    }
}