import {Utils} from './Util';
import {Config} from "./Config";

class FunctionObj {
    params: any;
    funcType: string;

    constructor(_functType?: string, _params?: any) {
        this.funcType = _functType ? _functType : "";
        this.params = _params ? _params : {};
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
                delete this.params.x;
                break;
            case "a":
                delete this.params.x;
                delete this.params.v;
                break;
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

    copyParams(): any {
        let newParams = {};
        Object.assign(newParams, this.params);
        return newParams;
    }

    getCorrectFunction(usedFunc?: any): FunctionObj {
        // Filter available function types
        let availableAxises = Config.axisIndexes.slice().deleteItem(this.funcType);
        if (usedFunc) availableAxises.deleteItem(usedFunc.funcType);

        let newParams = this.copyParams(),
            pickedAxis = availableAxises.getRandom();

        return new FunctionObj(pickedAxis, newParams).makeCorrectParams().clearParams();
    }


    // TODO:
    //  Here we "Integrating" function and add a free variable.
    //  So we must pick params which will be easy to understand on graphic.
    //  I guess this algorithm must be in makeClearer function.
    makeCorrectParams(): FunctionObj {
        let existingParams = Object.keys(this.params),
            params = this.params;

        // TODO: read this
        // This block always in the end of make___params, so we can move it to makeClearer(change name to create missing)
        //  and create algorithm for "easy to read on graphic" params
        if (!existingParams.contains("x") && this.funcType == "x")
            params.x = Utils.getRandomNonZeroFromBound(Config.X);
        if (!existingParams.contains("v") && (this.funcType == "x" || this.funcType == "v"))
            params.v = Utils.getRandomNonZeroFromBound(Config.V);

        return this.makeClearer();
    }

    getIncorrectFunction(usedFuncs?: Array<any>): FunctionObj {
        let availableAxises = Config.axisIndexes.slice().deleteItem(this.funcType);

        let newParams = this.copyParams(),
            pickedAxis = availableAxises.getRandom();

        let incorrectFunction = new FunctionObj(pickedAxis, newParams).makeIncorrectParams().clearParams();
        if (usedFuncs)
            for (let answer of usedFuncs)
                if (answer != undefined && incorrectFunction.equalTo(answer as FunctionObj))
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

        // TODO: This is a free variables, so we need make it easy to read on graph
        //  (exclude variant with function starting on top and going to the sky)

        // TODO: read this
        // This block always in the end of make___params, so we can move it to makeClearer(change name to create missing)
        //  and create algorithm for "easy to read on graphic" params
        if (this.funcType == "x") {
            if (!paramsKeys.contains("x"))
                params.x = Utils.getRandomNonZeroFromBound(Config.X);
            if (!paramsKeys.contains("v"))
                params.v = Utils.getRandomFromBound(Config.V);
        }
        if (this.funcType == "v")
            params.v = Utils.getRandomNonZeroFromBound(Config.V);

        return this.makeClearer();
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
        this.generateParams().clearParams();

        if (usedFuncs)
            for (let func of usedFuncs)
                if (this.equalTo(func))
                    return this.makeQuestionFunction(usedFuncs);

        return this;
    }


}

export default FunctionObj;
