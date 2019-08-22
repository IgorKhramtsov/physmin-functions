import {Utils} from './Util';
import {Config} from "./Config";

export class FunctionObj {
    params: any;
    funcType: string;

    constructor(_funcType?: string, _params?: any) {
        this.funcType = _funcType ? _funcType : "";
        this.params = _params ? _params : {};
    }

    // -----------------------------------------------------------------------------
    // Utils
    // -----------------------------------------------------------------------------
    equalByTextTo(obj: FunctionObj): boolean {
        return this.getTextDescription(false) === obj.getTextDescription(false)
    }

    equalBySignTo(obj: FunctionObj): boolean {
        if (obj === undefined) return false;

        if (this.funcType === obj.funcType) {
            if (this.params.x !== undefined && obj.params.x !== undefined) {
                if ((Math.sign(this.params.x) === Math.sign(obj.params.x)) &&
                    (Math.sign(this.params.v) === Math.sign(obj.params.v)) &&
                    (Math.sign(this.params.a) === Math.sign(obj.params.a)))
                    return true;
            }
            else if (this.params.v !== undefined && obj.params.v !== undefined) {
                if ((Math.sign(this.params.v) === Math.sign(obj.params.v)) &&
                    (Math.sign(this.params.a) === Math.sign(obj.params.a))) {
                    return true;
                }
            }
            else if (this.params.a !== undefined && obj.params.a !== undefined) {
                if ((Math.sign(this.params.a) === Math.sign(obj.params.a)))
                    return true;
            }
        }
        return false;
    }

    equalByValueTo(obj: FunctionObj): boolean {
        if (obj === undefined) return false;

        if (this.funcType === obj.funcType)
            if (this.params.x === obj.params.x &&
                this.params.v === obj.params.v &&
                this.params.a === obj.params.a)
                return true;

        return false;
    }

    equalByDirectionTo(obj: FunctionObj): boolean {
        // Functions have equal directions when their derivatives have equal sign
        let this_dir: number,
            nextFunc_dir: number;
        switch (obj.funcType) {
            case "x":
                this_dir = this.params.v + this.params.a * this.params.len;
                nextFunc_dir = obj.params.v + obj.params.a * obj.params.len;
                return Math.sign(this_dir) === Math.sign(nextFunc_dir);
            case "v":
                this_dir = this.params.a;
                nextFunc_dir = obj.params.a;
                return Math.sign(this_dir) === Math.sign(nextFunc_dir);
        }

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

        // Imputes necessary parameters for that type of function
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

    generateParams() {
        let x, v, a = 0;
        x = Utils.getRandomOrZeroFromBound(Config.X);
        v = Utils.getRandomOrZeroFromBound(Config.V);
        if (Utils.withChance(0.7))
            a = Utils.getRandomOrZeroFromBound(Config.A);

        if (x === 0 && v === 0 && a === 0)
            this.generateParams();
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

    // -----------------------------------------------------------------------------
    // Creating FUNCTIONS
    // -----------------------------------------------------------------------------
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

    // -----------------------------------------------------------------------------
    // Wrangling with TEXT
    // -----------------------------------------------------------------------------
    getKeyByValue(object: any, value: any): string {
        // Returns text by value or sign
        let _key = Object.keys(object).find(key => object[key] === value);
        if (_key) return _key;
        else throw Error("Key is not found!");
    }

    getTextDescription(isComplex: boolean): string {
        let params = this.params,
            text = "",
            x = params.x,
            v = params.v,
            a = params.a;

        // Returns description of function behavior by its parameters
        if (x !== undefined && v !== undefined && a !== undefined) {

            if (x == 0 && v == 0 && a == 0) {
                text += this.getKeyByValue(Config.movement, 0);
                text += ' ' + this.getKeyByValue(Config.position, 0);
            }

            else if (x != 0 && v == 0 && a == 0) {
                text += this.getKeyByValue(Config.movement, 0);
                text += ' ' + this.getKeyByValue(Config.position, Math.sign(x));
            }

            else {
                //IDENTICAL BLOCK #1
                if (v !== 0)
                    if (a !== 0) {
                        text += this.getKeyByValue(Config.movement, 1);
                        text += ' ' + this.getKeyByValue(Config.directions, Math.sign(v));
                        text += ', ' + this.getKeyByValue(Config.how, Math.sign(a));
                    }
                    else {
                        text += this.getKeyByValue(Config.movement, 1);
                        text += ' ' + this.getKeyByValue(Config.how, 0);
                    }
                else if (a !== 0) {
                    text += this.getKeyByValue(Config.movement, 1);
                    text += ' ' + this.getKeyByValue(Config.how, Math.sign(a));
                }
                else {
                    text += this.getKeyByValue(Config.movement, 0);
                    text += ' ' + this.getKeyByValue(Config.position, 0);
                }
            }

        }
        else if (v !== undefined && a !== undefined) {
            //IDENTICAL BLOCK #2
            if (v !== 0)
                if (a !== 0) {
                    text += this.getKeyByValue(Config.movement, 1);
                    text += ' ' + this.getKeyByValue(Config.directions, Math.sign(v));
                    text += ', ' + this.getKeyByValue(Config.how, Math.sign(a));
                }
                else {
                    text += this.getKeyByValue(Config.movement, 1);
                    text += ' ' + this.getKeyByValue(Config.how, 0);
                }
            else if (a !== 0) {
                text += this.getKeyByValue(Config.movement, 1);
                text += ' ' + this.getKeyByValue(Config.how, Math.sign(a));
            }
            else {
                text += this.getKeyByValue(Config.movement, 0);
                text += ' ' + this.getKeyByValue(Config.position, 0);
            }
        }
        // --------------------------------------------------------------------
        else if (a !== undefined) {
                text += this.getKeyByValue(Config.movement, 1);
                text += ' ' + this.getKeyByValue(Config.how, Math.sign(a));
        }
        else throw new Error('Incorrect func type.');

        if (isComplex) {
            if (text[0] === ' ') text = text.substr(1);
            text = text.charAt(0).toUpperCase() + text.slice(1);
        }
        return text;
    }

    //--------------------------------------------------------------------------------------------------
    // Control function behavior
    //--------------------------------------------------------------------------------------------------
    limitValues() {
        const funcType = this.funcType,
            params = this.params,
            len = this.params.len;
        let value = this.calcFunctionValue(),
            result = 0;

        if (value != 0)
            result = Math.min(Math.abs(value), Config.upperLimit) * Math.sign(value);

        switch (funcType) {
            case "x":
                if (params.v !== 0 && params.a !== 0) {
                    let v_calc = (result - params.x - (params.a * len * len) / 2) / len,
                        a_calc = 2 * (result - params.x - params.v * len) / (len * len),
                        sign_a = Math.sign(params.a), sign_v = Math.sign(params.v);

                    if (sign_a === Math.sign(a_calc) && sign_v === Math.sign(v_calc)) {
                        if (sign_v === 0)
                            params.a = a_calc;
                        else
                            params.v = v_calc;
                    }
                    else if (sign_a === -Math.sign(a_calc))
                        params.v = v_calc;
                    else if (sign_v === -Math.sign(v_calc))
                        params.a = a_calc;
                    else throw Error("Case 'x'. Incorrect composition of params.")
                }
                else if (params.v !== 0) params.v = (result - params.x - (params.a * len * len) / 2) / len;
                else if (params.a !== 0) params.a = 2 * (result - params.x - params.v * len) / (len * len);
                break;
            case "v":
                if (params.a !== 0)
                    params.a = (result - params.v) / len;
                break;
        }

        return this;
    }

    snapToGrid(): FunctionObj {
        const funcType = this.funcType,
            params = this.params;

        if (funcType == 'x' || funcType == 'v')
            params[funcType] = Math.round(params[funcType]);

        return this;
    }

    // -----------------------------------------------------------------------------
    // Computing values
    // -----------------------------------------------------------------------------
    calcFunctionValue(len?: number): number {
        const params = this.params,
            t = len !== undefined ? len : params.len;
        let value: number;

        switch (this.funcType) {
            case "x":
                value = params.x + params.v * t + (params.a * t * t) / 2;
                return Math.round(value * 100) / 100;
            case "v":
                value = params.v + params.a * t;
                return Math.round(value * 100) / 100;
            case "a":
                value = params.a;
                return Math.round(value * 100) / 100;
        }
        throw Error('Incorrect type of function.');
    }

    calcIntegral(): number {
        const params = this.params;

        switch (this.funcType) {
            case "x":
                return params.x * params.len + (params.v * params.len * params.len) / 2 +
                    (params.a * params.len * params.len * params.len) / 6;
            case "v":
                return params.v * params.len + (params.a * params.len * params.len) / 2;
        }
        return 0;
    }

    isConvex(start: number = 0, end: number = this.params.len) {
        let params = this.params,
            value_start: number,
            value_end: number,
            value_extremum: number,
            coord: number;

        value_start = this.calcFunctionValue(start);
        value_end = this.calcFunctionValue(end);

        switch (this.funcType) {
            case 'x':
                if (params.a === 0)
                    return Math.abs(value_start) > Config.upperLimit || Math.abs(value_end) > Config.upperLimit;
                else {
                    coord = -params.v / params.a;
                    value_extremum = this.calcFunctionValue(coord);
                    return Math.abs(value_start) > Config.upperLimit || Math.abs(value_end) > Config.upperLimit ||
                        Math.abs(value_extremum) > Config.upperLimit;
                }
            case 'v':
                return Math.abs(value_start) > Config.upperLimit || Math.abs(value_end) > Config.upperLimit;
        }

        return false;
    }

    static calcFuncValueFromRange(start: number, end: number, functions: Array<FunctionObj>): number {
        let result = 0;

        for (let i = start; i < end + 1; i++)
            result += functions[i].calcIntegral();

        return result;
    }


    // -----------------------------------------------------------------------------
    // Holy shet for RELATION SIGNS
    // -----------------------------------------------------------------------------
    static getIndexes(questionCount: number, answersCount: number): Array<Array<Array<number>>> {
        let indexes = Array<Array<Array<number>>>();

        // Returns unique couple of indices (read - points) on coordinate plane
        for (let i = 0; i < answersCount; i++)
            indexes.push(FunctionObj.createNextCoupleIndexes(questionCount, indexes));

        return indexes;
    }

    static createNextCoupleIndexes(questionCount: number, usedCoupleIndexes: Array<Array<Array<number>>>, recursive_count?: number): Array<Array<number>> {
        if (!recursive_count) recursive_count = 1;
        else if (recursive_count === 30) throw new Error('To much recursive calls.');

        const leftCoupleIndexes = FunctionObj.createNextIndex(questionCount),
            rightCoupleIndexes = FunctionObj.createNextIndex(questionCount, [leftCoupleIndexes]);
        let nextCoupleIndexes = [leftCoupleIndexes, rightCoupleIndexes];


        // Sorts indices of couple
        if (leftCoupleIndexes[0] > rightCoupleIndexes[0])
            nextCoupleIndexes = [rightCoupleIndexes, leftCoupleIndexes];
        else if (leftCoupleIndexes[0] === rightCoupleIndexes[0])
            if (leftCoupleIndexes[1] > rightCoupleIndexes[1])
                nextCoupleIndexes = [rightCoupleIndexes, leftCoupleIndexes];

        for (const coupleIndexes of usedCoupleIndexes)
            if (FunctionObj.indexToString(nextCoupleIndexes[0]) === FunctionObj.indexToString(coupleIndexes[0]) &&
                FunctionObj.indexToString(nextCoupleIndexes[1]) === FunctionObj.indexToString(coupleIndexes[1]))
                return FunctionObj.createNextCoupleIndexes(questionCount, usedCoupleIndexes, ++recursive_count);

        return nextCoupleIndexes;
    }

    static createNextIndex(questionCount: number, usedIndex?: Array<Array<number>>): Array<number> {
        let leftIndex,
            rightIndex,
            nextIndex: Array<number>,
            iter_count = 0;


        rightIndex = questionCount.getRandom();
        for (iter_count = 0; iter_count < 30 && (leftIndex === rightIndex || leftIndex === undefined); ++iter_count)
            leftIndex = questionCount.getRandom();

        if (leftIndex === rightIndex || leftIndex === undefined) throw new Error('To many cycle iterations.');

        nextIndex = [leftIndex, rightIndex].sort();
        if (usedIndex)
            for (const index of usedIndex)
                if (index[0] === nextIndex[0] && index[1] === nextIndex[1])
                    return FunctionObj.createNextIndex(questionCount, usedIndex);

        return nextIndex;
    }

    static indexToString(index: Array<number>): String {
        return index[0].toString() + index[1].toString();
    }
}

