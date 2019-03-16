import {Utils} from './Util';
import {Config} from "./Config";

class FunctionObj {
    params: any;
    funcType: string;

    constructor(_functType: string, _params: any) {
        //this.params = {x: _x, v: _v, a: _a};
        this.params = _params;

        this.funcType = _functType;
    }

    equalTo(obj: FunctionObj) {
        if (this.funcType == obj.funcType)
            if (Math.sign(this.params.x) == Math.sign(obj.params.x) &&
                Math.sign(this.params.v) == Math.sign(obj.params.v) &&
                Math.sign(this.params.a) == Math.sign(obj.params.a))
                return true;
        return false;
    }

    clearParams() {
        switch (this.funcType) {
            case "x":
                break;
            case "v":
                this.params.x = 0;
                break;
            case "a":
                this.params.x = 0;
                this.params.v = 0;
                break;
        }
        return this;
    }

    getCorrectFunction(usedFunc?: any): FunctionObj {
        let availableAxises = Config.axisIndex.slice().deleteItem(this.funcType);
        if (usedFunc) availableAxises.deleteItem(usedFunc.funcType);

        let newParams = JSON.parse(JSON.stringify(this.params));
        let pickedAxis = availableAxises.getRandom();

        return new FunctionObj(pickedAxis, newParams).makeCorrectParams();
    }

    makeCorrectParams(): FunctionObj {
        let axises = Object.keys(this.params),
            params = this.params;

        if (axises.indexOf("x") == -1 && this.funcType == "x")
            params.x = Utils.getRandomNonZeroFromBound(Config.X);
        if (axises.indexOf("v") == -1 && (this.funcType == "x" || this.funcType == "v"))
            params.v = Utils.getRandomNonZeroFromBound(Config.V);

        return this.makeClearer();
    }

    getIncorrectFunction(usedFuncs?: Array<any>): FunctionObj {
        let availableAxises = Config.axisIndex.slice().deleteItem(this.funcType);

        let newParams = JSON.parse(JSON.stringify(this.params)),
            pickedAxis = availableAxises.getRandom();

        let incorrectFunction = new FunctionObj(pickedAxis, newParams).makeIncorrectParams().clearParams();
        if (usedFuncs)
            for (let answer of usedFuncs) {
                if (answer == undefined)
                    continue;
                if (incorrectFunction.equalTo(answer.graph as FunctionObj))
                    return this.getIncorrectFunction(usedFuncs);
            }

        return incorrectFunction;
    }

    makeIncorrectParams() {
        let params = this.params,
            paramsKeys = Object.keys(params);

        // Invert current params
        for (let p_key of paramsKeys) {
            switch (Math.sign(params[p_key])) {
                case 1:
                case -1:
                    params[p_key] = Utils.withChance(0.5) ? -params[p_key] : 0;
                    break;
                case 0:
                    params[p_key] = Utils.withChance(0.5) ? 1 : -1;
                    break;
            }
            params[p_key] = Utils.getRandomNonZeroFromBound(p_key) * Math.sign(params[p_key]);
        }

        let a: string,
            b: string;
        if (Math.sign(params["v"]) == Math.sign(params["a"]) && Math.sign(params["a"]) != 0) {
            if (Utils.withChance(0.5)) {
                a = "v";
                b = "a";
            } else {
                a = "a";
                b = "v";
            }

            params[a] = Utils.withChance(0.5) ? -params[b] : 0;
            params[a] = Utils.getRandomNonZeroFromBound(a) * Math.sign(params[b]);
        }


        // Add deficit params
        if (this.funcType == "x") {
            if (paramsKeys.indexOf("x") == -1)
                params.x = Utils.getRandomNonZeroFromBound(Config.X);
            if (paramsKeys.indexOf("v") == -1)
                params.v = Utils.getRandomFromBound(Config.V);
        }
        if (this.funcType == "v")
            params.v = Utils.getRandomNonZeroFromBound(Config.V);

        return this;
    }

    generateParams() {
        let x, v, a = 0;
        x = Utils.getRandomFromBound(Config.X);
        v = Utils.getRandomFromBound(Config.V);
        if (Utils.withChance(0.5))
            a = Utils.getRandomFromBound(Config.A);

        if (x == 0 && v == 0 && a == 0)
            this.generateParams();

        this.params = {"x": x, "v": v, "a": a};
    }

    makeQuestionFunction(prevFunc?: Array<FunctionObj>): FunctionObj {
        this.funcType = Config.axisIndex.getRandom();
        this.generateParams();

        if (prevFunc)
            for (let func of prevFunc)
                if (this.equalTo(func))
                    return this.makeQuestionFunction(prevFunc);

        switch (this.funcType) {
            case "x":
                return this;
            case "v":
                delete this.params.x;
                return this;
            case "a":
                delete this.params.x;
                delete this.params.v;
                return this;
        }
        return this;
    }

    makeClearer(): FunctionObj {
        if (this.params.x == 0 && this.params.v == 0 && this.params.a != 0)
            this.params.a *= 10;
        else if (this.params.x == 0 && this.params.a == 0 && this.params.v != 0)
            this.params.v *= 3;
        return this;
    }
}

export default FunctionObj;
