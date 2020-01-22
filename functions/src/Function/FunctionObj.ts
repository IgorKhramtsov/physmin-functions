import {Utils} from '../Util';
import {Config} from "../Config";
import {FunctionComparison} from "./FunctionComparisons";
import {FunctionValues} from "./FunctionValues";
import {FunctionBehavior} from "./FunctionBehavior";


export class FunctionObj {
    params: any;
    funcType: string;

    behavior: any;
    comparisons: any;
    values: any;

    constructor(_funcType?: string, _params?: any) {
        this.funcType = _funcType ? _funcType : "";
        this.params = _params ? _params : {};
        this.behavior.functionObj = this;
        this.comparisons.functionObj = this;
        this.values.functionObj = this;
    }


    //-------------------------------------------
    // Operations with function parameters
    //-------------------------------------------
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
            params = this.params,
            Axes = Config.Axes;

        // Imputes necessary parameters for that type of function
        if (this.funcType === "x") {
            if (!paramsKeys.contains("x"))
                params.x = Utils.getRandomNonZeroFromBound(Axes.X);
            if (!paramsKeys.contains("v"))
                params.v = Utils.getRandomFromBound(Axes.V);
        }
        if (this.funcType === "v")
            if (!paramsKeys.contains("v"))
                params.v = Utils.getRandomNonZeroFromBound(Axes.V);

        return this;
    }

    generateParams(): FunctionObj {
        let x, v, a = 0;
        const Axes = Config.Axes;

        x = Utils.getRandomOrZeroFromBound(Axes.X);
        v = Utils.getRandomOrZeroFromBound(Axes.V);
        if (Utils.withChance(0.7))
            a = Utils.getRandomOrZeroFromBound(Axes.A);

        if (x === 0 && v === 0 && a === 0)
            return this.generateParams();

        if (Math.sign(v) === Math.sign(a)) {
            if (Utils.withChance(0.5)) {
                if (v !== 0) v = -v;
            }
            else if (a !== 0) a = -a;
        }

        this.params = {"x": x, "v": v, "a": a};
        return this;
    }

    copyParams(): any {
        return Object.assign({}, this.params);
    }

    makeCorrectParams(): FunctionObj {
        return this.makeFreeVariables();
    }

    makeIncorrectParams(): FunctionObj {
        const params = this.params,
            paramsKeys = Object.keys(params).deleteItem("len");
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
        return this.makeFreeVariables();
    }

    //-------------------------------------------
    // Text description of function behavior
    //-------------------------------------------
    getKeyByValue(object: any, value: any): string {
        // Returns text by value or sign
        const _key = Object.keys(object).find(key => object[key] === value);
        if (_key) return _key;
        else throw Error("Key is not found!");
    }

    getTextDescription(isComplex: boolean): string {
        const params = this.params,
            textOf = Config.TextDescription,
            X = params.x,
            V = params.v,
            A = params.a,
            getText = (s: object, v: number) => this.getKeyByValue(s, v);
        let text = "";

        // Returns description of function behavior by its parameters
        if (X !== undefined && V !== undefined && A !== undefined) {
            if (X === 0 && V === 0 && A === 0) {
                text += getText(textOf.movement, 0);
                text += ' ' + getText(textOf.position, 0);
            }
            else if (X !== 0 && V === 0 && A === 0) {
                text += getText(textOf.movement, 0);
                text += ' ' + getText(textOf.position, Math.sign(X));
            }
            else {
                //IDENTICAL BLOCK #1
                if (V !== 0)
                    if (A !== 0) {
                        text += getText(textOf.movement, 1);
                        text += ' ' + getText(textOf.directions, Math.sign(V));
                        text += ', ' + getText(textOf.how, Math.sign(A));
                    }
                    else {
                        text += getText(textOf.movement, 1);
                        text += ' ' + getText(textOf.how, 0);
                    }
                else if (A !== 0) {
                    text += getText(textOf.movement, 1);
                    text += ' ' + getText(textOf.directions, 0);
                    text += ' ' + getText(textOf.how, Math.sign(A));
                }
                else {
                    text += getText(textOf.movement, 0);
                    text += ' ' + getText(textOf.position, 0);
                }
            }
        }
        else if (V !== undefined && A !== undefined) {
            //IDENTICAL BLOCK #2
            if (V !== 0)
                if (A !== 0) {
                    text += getText(textOf.movement, 1);
                    text += ' ' + getText(textOf.directions, Math.sign(V));
                    text += ', ' + getText(textOf.how, Math.sign(A));
                }
                else {
                    text += getText(textOf.movement, 1);
                    text += ' ' + getText(textOf.how, 0);
                }
            else if (A !== 0) {
                text += getText(textOf.movement, 1);
                text += ' ' + getText(textOf.directions, 0);
                text += ' ' + getText(textOf.how, Math.sign(A));
            }
            else text += getText(textOf.movement, 0);
        }
        else if (A !== undefined) {
            text += getText(textOf.movement, 1);
            text += ' ' + getText(textOf.how, Math.sign(A));
        }
        else throw new Error('Incorrect function type.');

        if (isComplex) {
            if (text[0] === ' ') text = text.substr(1);
            text = text.charAt(0).toUpperCase() + text.slice(1);
        }
        return text;
    }

}

FunctionObj.prototype.behavior = FunctionBehavior;
FunctionObj.prototype.comparisons = FunctionComparison;
FunctionObj.prototype.values = FunctionValues;
