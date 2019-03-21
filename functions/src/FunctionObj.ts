import {Utils} from './Util';
import {Config} from "./Config";

class FunctionObj {
    params: any;
    funcType: string;

    constructor(_funcType?: string, _params?: any) {
        this.funcType = _funcType ? _funcType : "";
        this.params = _params ? _params : {};
    }

    equalTo(obj: FunctionObj) {
        if (this.funcType == obj.funcType)
            if ((Math.sign(this.params.x) == Math.sign(obj.params.x) || this.params.x === obj.params.x) &&
                (Math.sign(this.params.v) == Math.sign(obj.params.v) || this.params.v === obj.params.v) &&
                (Math.sign(this.params.a) == Math.sign(obj.params.a) || this.params.a === obj.params.a))
                return true;
        return false;
    }

    clearParams() {
        // Takes type of function and deletes unnecessary params for that type
        switch (this.funcType) {
            case "x":
                break;
            case "v":
                delete this.params.x;
                break;
            case "a":
                delete this.params.x;
                delete this.params.v;
                break;
        }
        return this;
    }

    makeFreeVariables(): FunctionObj {
        let paramsKeys = Object.keys(this.params),
            params = this.params;

        if (this.funcType == "x") {
            if (!paramsKeys.contains("x"))
                params.x = Utils.getRandomNonZeroFromBound(Config.X);
            if (!paramsKeys.contains("v"))
                params.v = Utils.getRandomFromBound(Config.V);
        }
        if (this.funcType == "v")
            if (!paramsKeys.contains("v"))
                params.v = Utils.getRandomNonZeroFromBound(Config.V);

        return this;
    }

    increaseIntensity() {
        if (this.params.x && this.funcType == "x") {
            if (Math.abs(this.params.x) < 1)
                this.params.x = 1 * Math.sign(this.params.x);
            if (Math.abs(this.params.v) > 0 && Math.abs(this.params.a) > 0)
                if (Math.sign(this.params.a) != Math.sign(this.params.v)) {
                    if (Math.abs(this.params.v) < 0.8)
                        this.params.v = 0.8 * Math.sign(this.params.v);
                }
                else if (Math.abs(this.params.a) < 0.5)
                    this.params.a = 0.5 * Math.sign(this.params.a)
        }
        if (this.params.v && this.funcType == "v")
            if (Math.abs(this.params.v) < 1)
                this.params.v = 1 * Math.sign(this.params.v);
        if (this.params.a && this.funcType == "a")
            if (Math.abs(this.params.a) < 1)
                this.params.a = 1 * Math.sign(this.params.a);
        return this;
    }

    copyParams(): any {
        return Object.assign({}, this.params);
    }

    getCorrectFunction(availableAxises: Array<any>, usedFunc?: Array<FunctionObj>): FunctionObj {
        // Filter available function types
        let newParams = this.copyParams(),
            pickedAxis = availableAxises.getRandom();
        let newFunc = new FunctionObj(pickedAxis, newParams).makeCorrectParams().clearParams();

        if (usedFunc)
            for (let func of usedFunc)
                if (func != undefined && newFunc.equalTo(func))
                    return this.getCorrectFunction(availableAxises, usedFunc);

        return newFunc;
    }

    makeCorrectParams(): FunctionObj {
        return this.makeFreeVariables().increaseIntensity();
    }

    getIncorrectFunction(usedFuncs?: Array<FunctionObj>): FunctionObj {
        let availableAxises = Config.axisIndexes.slice().deleteItem(this.funcType);

        let newParams = this.copyParams(),
            pickedAxis = availableAxises.getRandom();

        let incorrectFunction = new FunctionObj(pickedAxis, newParams).makeIncorrectParams().clearParams();
        if (usedFuncs)
            for (let func of usedFuncs)
                if (func != undefined && incorrectFunction.equalTo(func))
                    return this.getIncorrectFunction(usedFuncs);

        return incorrectFunction;
    }

    makeIncorrectParams() {
        let params = this.params,
            paramsKeys = Object.keys(params);

        // Inverting current params
        for (let key of paramsKeys) {
            switch (Math.sign(params[key])) {
                case 1:
                case -1:
                    params[key] = Utils.withChance(0.5) ? -params[key] : 0;
                    break;
                case 0:
                    params[key] = Utils.withChance(0.5) ? 1 : -1;
                    break;
            }
            params[key] = Utils.getRandomWithSign(key, params[key]);
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
            params[a] = Utils.getRandomWithSign(a, params[a]);
        }

        return this.makeFreeVariables().increaseIntensity();
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
        return this;
    }

    makeQuestionFunction(usedFuncs?: Array<FunctionObj>): FunctionObj {
        this.funcType = Config.axisIndexes.getRandom();
        this.generateParams().clearParams().increaseIntensity();

        if (usedFuncs)
            for (let func of usedFuncs)
                if (this.equalTo(func))
                    return this.makeQuestionFunction(usedFuncs);

        return this;
    }

    getText() {
        let params = this.params,
            text = "";
        //If graph with 1 func
        if (Math.sign(params.v) == -1)
            text += "назад";

        if (Math.sign(params.v) == 1)
            text += "вперед";

        switch (Math.sign(params.a)) {
            case 0:
                text += " равномерно";
                break;
            case 1:
                text += " ускоряясь вперед";
                break;
            case -1:
                text += " ускоряясь назад";
                break;
        }
        if (params.v == 0 && params.a == 0) {
            if (Math.sign(params.x) == 1)
                text = "покой выше нуля";
            else if (Math.sign(params.x) == -1)
                text = "покой ниже нуля";
            else text = "все время покой";
        }

        if (text[0] == ' ')
            text = text.substr(1);
        text = text.charAt(0).toUpperCase() + text.slice(1);
        return text;
    }
}

export default FunctionObj;
