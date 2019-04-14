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
        if (obj === undefined) return false;

        if (this.funcType === obj.funcType)
            if ((Math.sign(this.params.x) === Math.sign(obj.params.x) || this.params.x === obj.params.x) &&
                (Math.sign(this.params.v) === Math.sign(obj.params.v) || this.params.v === obj.params.v) &&
                (Math.sign(this.params.a) === Math.sign(obj.params.a) || this.params.a === obj.params.a))
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
        const paramsKeys = Object.keys(this.params),
            params = this.params;

        if (this.funcType === "x") {
            if (!paramsKeys.contains("x"))
                params.x = Utils.getRandomNonZeroFromBound(Config.X);
            if (!paramsKeys.contains("v"))
                params.v = Utils.getRandomFromBound(Config.V);
        }
        if (this.funcType === "v")
            if (!paramsKeys.contains("v"))
                params.v = Utils.getRandomNonZeroFromBound(Config.V);

        return this;
    }

    increaseIntensity() {
        const params = this.params,
            funcType = this.funcType;
        if (params.x && funcType === "x") {
            if (Math.abs(params.x) < 1)
                params.x = 1 * Math.sign(params.x);
            if (Math.abs(params.v) > 0 && Math.abs(params.a) > 0)
                if (Math.sign(params.a) !== Math.sign(params.v)) {
                    if (Math.abs(params.v) < 0.8)
                        params.v = 0.8 * Math.sign(params.v);
                } else if (Math.abs(params.a) < 0.5)
                    params.a = 0.5 * Math.sign(params.a)
        }
        if (params.v && funcType === "v")
            if (Math.abs(params.v) < 1)
                params.v = 1 * Math.sign(params.v);
        if (params.a && funcType === "a")
            if (Math.abs(params.a) < 1)
                params.a = 1 * Math.sign(params.a);
        return this;
    }

    copyParams(): any {
        return Object.assign({}, this.params);
    }

    getCorrectFunction(availableAxises: Array<any>, usedFunc?: Array<FunctionObj>): FunctionObj {
        // Filter available function types
        const _availableAxises = availableAxises.copy().deleteItem(this.funcType),
            pickedAxis = _availableAxises.getRandom(),
            newParams = this.copyParams();

        if (pickedAxis === undefined)
            throw new Error("Cannot pick axis. Looks like available axises list is empty.");

        const newFunc = new FunctionObj(pickedAxis, newParams).makeCorrectParams().clearParams();

        if (usedFunc)
            for (const func of usedFunc)
                if (newFunc.equalTo(func))
                    return this.getCorrectFunction(_availableAxises, usedFunc);

        return newFunc;
    }

    makeCorrectParams(): FunctionObj {
        return this.makeFreeVariables().increaseIntensity();
    }

    getIncorrectFunction(availableAxises: Array<any>, usedFuncs?: Array<FunctionObj>): FunctionObj {
        const _availableAxises = availableAxises.copy().deleteItem(this.funcType),
            pickedAxis = _availableAxises.getRandom(),
            newParams = this.copyParams();

        if (pickedAxis === undefined)
            throw new Error("Cannot pick axis. Looks like available axises list is empty.");

        const incorrectFunction = new FunctionObj(pickedAxis, newParams).makeIncorrectParams().clearParams();
        if (usedFuncs)
            for (const func of usedFuncs)
                if (incorrectFunction.equalTo(func))
                    return this.getIncorrectFunction(_availableAxises, usedFuncs);

        return incorrectFunction;
    }

    makeIncorrectParams() {
        const params = this.params,
            paramsKeys = Object.keys(params).deleteItem("t");

        // Inverting current params
        for (const key of paramsKeys) {
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

        // If two vectors have same direction make them opposite
        // let a: string,
        //     b: string;
        // if (Math.sign(params["v"]) == Math.sign(params["a"]) && Math.sign(params["a"]) != 0) {
        //     if (Utils.withChance(0.5)) {
        //         a = "v";
        //         b = "a";
        //     } else {
        //         a = "a";
        //         b = "v";
        //     }
        //
        //     params[a] = Utils.withChance(0.5) ? -params[b] : 0;
        //     params[a] = Utils.getRandomWithSign(a, params[a]);
        // }

        return this.makeFreeVariables().increaseIntensity();
    }

    generateParams() {
        let x, v, a = 0;
        x = Utils.getRandomFromBound(Config.X);
        v = Utils.getRandomFromBound(Config.V);
        if (Utils.withChance(0.5))
            a = Utils.getRandomFromBound(Config.A);

        if (x === 0 && v === 0 && a === 0)
            this.generateParams();

        this.params = {"x": x, "v": v, "a": a};
        return this;
    }

    makeQuestionFunction(availableAxises: Array<string>, usedFuncs?: Array<FunctionObj>): FunctionObj {
        this.funcType = availableAxises.getRandom();
        this.generateParams().clearParams().increaseIntensity();

        if (usedFuncs)
            for (const func of usedFuncs)
                if (this.equalTo(func))
                    return this.makeQuestionFunction(availableAxises, usedFuncs);

        return this;
    }

    getText(flag: boolean) {
        let params = this.params,
            text = "";

        if (Math.sign(params.v) === -1)
            text += "назад";

        if (Math.sign(params.v) === 1)
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
        if (params.v === 0 && params.a === 0) {
            if (Math.sign(params.x) == 1)
                text = "покой выше нуля";
            else if (Math.sign(params.x) === -1)
                text = "покой ниже нуля";
            else text = "все время покой";
        }

        if (flag) {
            if (text[0] === ' ')
                text = text.substr(1);
            text = text.charAt(0).toUpperCase() + text.slice(1);
        }
        return text;
    }

    createNextFunction(usedFunctions?: Array<FunctionObj>, questionInterval?: number): FunctionObj {
        const funcType = this.funcType,
            nextFunc = new FunctionObj(funcType).generateParams().clearParams();

        let len: number;
        if (questionInterval)
            len = Math.round(Utils.getRandomFromRange(Config.minLength, questionInterval));
        else
            len = Math.round(Utils.getRandomFromBound("t"));
        switch (funcType) {
            case "x":
                nextFunc.params.x = this.calculateFunctionValue(len);
                break;
            case "v":
                nextFunc.params.v = this.calculateFunctionValue(len);
                break;
        }

        if (usedFunctions)
            for (const func of usedFunctions)
                if (nextFunc.equalTo(func))
                    return this.createNextFunction(usedFunctions, questionInterval);
        this.params.len = len;

        return nextFunc;
    }

    calculateFunctionValue(t: number) {
        const params = this.params;

        switch (this.funcType) {
            case "x":
                return params.x + params.v * t + (params.a * t * t) / 2;
            case "v":
                return params.v + params.a * t;
            case "a":
                return params.a;
        }

    }

    static calcFuncValueFromRange(start: number, end: number, letter: string, functions: Array<FunctionObj>):number {
        let value = 0;
        if (letter === "S")
            for (let i = end; i !== start; i--) {
                value += functions[i].params.len;
            }
        else
            value = functions[end].calculateFunctionValue(functions[end].params.len)
                - functions[start].calculateFunctionValue(0);
        return value;
    }

    static getIndexes(questionCount: number, answersCount: number) {
        let indexes = Array<Array<Array<number>>>();
        for (let i = 0; i < answersCount; i++) {
            indexes.push(FunctionObj.createNextCoupleIndexes(questionCount, indexes));
        }
        return indexes;
    }

    static createNextCoupleIndexes(questionCount: number, usedCoupleIndexes: Array<Array<Array<number>>>):  Array<Array<number>> {

        let leftCoupleIndexes = FunctionObj.createNextIndex(questionCount),
            rightCoupleIndexes = FunctionObj.createNextIndex(questionCount, [leftCoupleIndexes]);

        let nextCoupleIndexes = [leftCoupleIndexes, rightCoupleIndexes];

        if (usedCoupleIndexes)
            for (const coupleIndexes of usedCoupleIndexes)
                if (FunctionObj.indexToString(nextCoupleIndexes[0]) === FunctionObj.indexToString(coupleIndexes[0]) &&
                    FunctionObj.indexToString(nextCoupleIndexes[1]) === FunctionObj.indexToString(coupleIndexes[1]))
                    return FunctionObj.createNextCoupleIndexes(questionCount, usedCoupleIndexes);

        return nextCoupleIndexes;
    }

    static createNextIndex(questionCount: number, usedIndex?:  Array<Array<number>>): Array<number> {
        let leftIndex, rightIndex;
        rightIndex = questionCount.getRandom();
        do leftIndex = questionCount.getRandom();
        while (leftIndex == rightIndex);

        let nextIndex = [leftIndex, rightIndex].sort();
        if (usedIndex)
            for (const index of usedIndex)
                if (index[0] === nextIndex[0] &&
                    index[1] === nextIndex[1])
                    return FunctionObj.createNextIndex(questionCount, usedIndex);

        return nextIndex;
    }

    static indexToString(index: Array<number>): String{
        return index[0].toString() + index[1].toString();
    }
}

export default FunctionObj;
