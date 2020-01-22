import {FunctionObj} from "./FunctionObj";
import {Config} from "../Config";

export class FunctionBehaviour {

    _functionObj: FunctionObj;

    constructor(functionObject: FunctionObj ) {
        this._functionObj = functionObject;
    }

    getFuncObj(): FunctionObj { return this._functionObj }

    snapEnd(): FunctionBehaviour {
        const   funcObj = this._functionObj,
                funcType = funcObj.funcType,
                params = funcObj.params,
                len = funcObj.params.len,
                X = params.x,
                V = params.v,
                A = params.a,
                value = funcObj.values.calcFinalValue();
            let result = 0;
    
            if (value !== 0)
                result = Math.round(Math.min(Math.abs(value), Config.Limits.upperLimit)) * Math.sign(value);
        
    
            switch (funcType) {
                case "x":
                    if (V !== 0 && A !== 0) {
                        const v_calc = (result - X - (A * len * len) / 2) / len,
                            a_calc = 2 * (result - X - V * len) / (len * len),
                            sign_a = Math.sign(A), sign_v = Math.sign(V);
    
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
                    else if (V !== 0) params.v = (result - X - (A * len * len) / 2) / len;
                    else if (A !== 0) params.a = 2 * (result - X - V * len) / (len * len);
                    break;
                case "v":
                    if (A !== 0)
                        params.a = (result - V) / len;
                    break;
            }
    
            return this;
        }

    snapBegin(): FunctionBehaviour {
        const   funcObj = this._functionObj,
                funcType = funcObj.funcType,
                params = funcObj.params;
    
        if (funcType === 'x' || funcType === 'v')
            params[funcType] = Math.round(params[funcType]);
    
        return this;
    }
    
    // Returns true if function reaches limits inside of segment
    isConvex(start: number = 0, end: number = 4): boolean {
        const   funcObj = this._functionObj,
                params = funcObj.params,
                upperLimit = Config.Limits.upperLimit;
        let     S: number,
                E: number,
                C: number,
                MaxValue: number;
        // Function value at start (S) and end (E) of segment
        S = funcObj.values.calcFinalValue(start);
        E = funcObj.values.calcFinalValue(end);
    
        switch (funcObj.funcType) {
            case 'x':
                if (params.a === 0)
                    return Math.abs(S) > upperLimit || Math.abs(E) > upperLimit;
                else {
                    C = -params.v / params.a;
                    MaxValue = funcObj.values.calcFinalValue(C);
                    return Math.abs(S) > upperLimit || Math.abs(E) > upperLimit ||
                        Math.abs(MaxValue) > upperLimit;
                }
            case 'v':
                return Math.abs(S) > upperLimit || Math.abs(E) > upperLimit;
        }
    
        return false;
    }
}
