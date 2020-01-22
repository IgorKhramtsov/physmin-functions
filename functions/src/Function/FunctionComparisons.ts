import {FunctionObj} from "./FunctionObj";
import {Config} from "../Config";


let FunctionComparison = {
    functionObj: FunctionObj,

    equalByTextTo(this: any, obj: FunctionObj): boolean {
        const funcObj = this.functionObj;
        return funcObj.getTextDescription(false) === obj.getTextDescription(false)
    },

    equalBySignTo(this: any, obj: FunctionObj): boolean {
        const funcObj = this.functionObj;
        if (funcObj === undefined || obj === undefined) return false;

        if (funcObj.funcType === obj.funcType) {
            if (funcObj.params.x !== undefined && obj.params.x !== undefined) {
                if ((Math.sign(funcObj.params.x) === Math.sign(obj.params.x)) &&
                    (Math.sign(funcObj.params.v) === Math.sign(obj.params.v)) &&
                    (Math.sign(funcObj.params.a) === Math.sign(obj.params.a)))
                    return true;
            }
            else if (funcObj.params.v !== undefined && obj.params.v !== undefined) {
                if ((Math.sign(funcObj.params.v) === Math.sign(obj.params.v)) &&
                    (Math.sign(funcObj.params.a) === Math.sign(obj.params.a))) {
                    return true;
                }
            }
            else if (funcObj.params.a !== undefined && obj.params.a !== undefined) {
                if ((Math.sign(funcObj.params.a) === Math.sign(obj.params.a)))
                    return true;
            }
        }
        return false;
    },

    equalByValueTo(this: any, obj: FunctionObj): boolean {
        if (obj === undefined) return false;

        const funcObj = this.functionObj;
        if (funcObj.funcType === obj.funcType)
            if (funcObj.params.x === obj.params.x &&
                funcObj.params.v === obj.params.v &&
                funcObj.params.a === obj.params.a)
                return true;

        return false;
    },

    equalByDirectionTo(this: any, obj: FunctionObj): boolean {
        const funcObj = this.functionObj;
        // Functions have equal directions when their derivatives have equal sign
        let this_dir: number,
            nextFunc_dir: number;
        switch (obj.funcType) {
            case "x":
                this_dir = funcObj.params.v + funcObj.params.a * funcObj.params.len;
                nextFunc_dir = obj.params.v + obj.params.a * obj.params.len;
                return Math.sign(this_dir) === Math.sign(nextFunc_dir);
            case "v":
                this_dir = funcObj.params.a;
                nextFunc_dir = obj.params.a;
                return Math.sign(this_dir) === Math.sign(nextFunc_dir);
        }

        return false;
    },
};

export {FunctionComparison}