import {FunctionObj} from './FunctionObj'
import {Config} from "../Config";
import {FunctionComparison} from "./FunctionComparisons";

export class FunctionBuilder {
    private usedQuestionObjects = Array<any>();
    private usedCorrectFuncs = Array<FunctionObj>();
    private usedIncorrectFuncs = Array<FunctionObj>();

    private doSnap = false;
    private doLimit = true;
    private functionLength = Config.Limits.defaultLength;
    private allowedAxes = Config.Axes.Set;
    private useAllowedAxes = true;
    private allowDuplicateText = true;


    //------------------------------------
    // Builder properties
    //------------------------------------
    reset() {
        this.usedQuestionObjects = Array<any>();
        this.usedCorrectFuncs = Array<FunctionObj>();
        this.usedIncorrectFuncs = Array<FunctionObj>();

        this.doSnap = false;
        this.functionLength = Config.Limits.defaultLength;
        this.allowedAxes = Config.Axes.Set;
        this.useAllowedAxes = true;
        this.allowDuplicateText = true;
    }

    setLength(length: number) {
        if (length < 0 || length > Config.Limits.defaultLength)
            throw Error('Parameter <functionLength> must be in [0,' + Config.Limits.defaultLength + '].');
        else if (length === 0)
            this.functionLength = Config.Limits.defaultLength;
        else
            this.functionLength = length;

        return this;
    }

    setAllowedAxes(axises: Array<string>) {
        if (axises.length <= 0) throw Error("Available axises array cant be empty!");

        this.allowedAxes = axises.copy();
        this.useAllowedAxes = true;
    }

    disableAllowedAxesUsage() {
        this.useAllowedAxes = false;
    }

    getAllowedAxes(): any {
        return this.allowedAxes.copy();
    }

    resetAllowedAxes() {
        this.allowedAxes = Config.Axes.Set.copy();
    }


    disableDuplicateText() {
        this.allowDuplicateText = false;
    }

    enableDuplicateText() {
        this.allowDuplicateText = true;
    }


    //------------------------------------
    // Methods that returns functions
    //------------------------------------
    getQuestionFunction(): FunctionObj {
        const questionObject = this.createQuestionObject();
        this.usedQuestionObjects.push(questionObject);

        return questionObject.func;
    }

    getCorrectFunction(): FunctionObj {
        const correctFunction = this.createCorrectFunction();
        this.usedCorrectFuncs.push(correctFunction);

        return correctFunction;
    }

    getIncorrectFunction(): FunctionObj {
        const incorrectFunction = this.createIncorrectFunction();
        this.usedIncorrectFuncs.push(incorrectFunction);

        return incorrectFunction;
    }

    getComplexFunction(functionsLengths: Array<number>): Array<FunctionObj> {
        return this.createComplexFunction(functionsLengths);
    }


    //------------------------------------
    // Methods that creates functions
    //------------------------------------
    private createQuestionObject(recursive_count?: number): any {
        if (!recursive_count) recursive_count = 1;
        if (recursive_count > 100) throw Error('Too much recursive calls');

        const questionObj = {
            func: new FunctionObj(this.allowedAxes.getRandom()).generateParams().clearParams(),
            axises: {}
        };
        questionObj.axises = Config.Axes.Set.copy().deleteItem(questionObj.func.funcType);

        for (const obj of this.usedQuestionObjects)
            if (questionObj.func.comparisons.equalBySignTo(obj.func)
                || questionObj.func.comparisons.equalByTextTo(obj.func))
                return this.createQuestionObject(++recursive_count);

        questionObj.func.params.len = this.functionLength;
        if (questionObj.func.behaviour.isConvex() && recursive_count < 10)
            return this.createQuestionObject(++recursive_count);

        
        questionObj.func.behaviour.snapBegin().snapEnd();
        return questionObj;
    }

    private createCorrectFunction(recursive_count?: number): FunctionObj {
        if (!recursive_count) recursive_count = 1;
        if (recursive_count > 100) throw Error('Too much recursive calls');
        if (this.usedQuestionObjects.length === 0) throw Error("There are none of question function");


        const questionObj = this.usedQuestionObjects.last();
        let correctFunc: FunctionObj,
            pickedAxis: string,
            newParams: any;

        if (this.useAllowedAxes === true)
            pickedAxis = this.allowedAxes.getRandom();
        else {
            if (questionObj.axises.length === 0) throw Error('There are none of available axises left.');
            else pickedAxis = questionObj.axises.getRandom();
        }

        newParams = questionObj.func.copyParams();
        correctFunc = new FunctionObj(pickedAxis, newParams).makeCorrectParams().clearParams();

        // if(this.allowDuplicateText == false){
        //     let count = 0;
        //     for(let usedQuestionObj of this.usedQuestionObjects){
        //         // if(this.checkCorrectFunc(usedQuestionObj.func, correctFunc))
        //         if((correctFunc))
        //             count++;
        //     }
        //     console.log(count);
        //     if(count > 1 && recursive_count < 10)
        //         return this.createCorrectFunction(++recursive_count);
        // }

        // if(this.allowDuplicateText == false)
        for (const usedCorrectFunc of this.usedCorrectFuncs)
            if (correctFunc.comparisons.equalByTextTo(usedCorrectFunc) && recursive_count < 20)
                return this.createCorrectFunction(++recursive_count);

        for (const usedIncorrectFunc of this.usedIncorrectFuncs)
            if (correctFunc.comparisons.equalByTextTo(usedIncorrectFunc) && recursive_count < 20)
                return this.createCorrectFunction(++recursive_count);

        correctFunc.params.len = this.functionLength;
        if (correctFunc.behaviour.isConvex() && recursive_count < 10)
            return this.createCorrectFunction(++recursive_count);

        if (this.useAllowedAxes === false) questionObj.axises.deleteItem(pickedAxis);

        // snapEnd affects function what should not be affected
        return correctFunc.behaviour.snapEnd().getFuncObj();
    }

    private checkCorrectFunc(questionFunc: FunctionObj, correctFunc: FunctionObj) {
        let forCompare: FunctionObj;
        const correctFuncType = correctFunc.funcType;

        switch (questionFunc.funcType) {
            case 'x':
                if (correctFuncType === 'v') {
                    forCompare = new FunctionObj(questionFunc.funcType, correctFunc.copyParams());
                    forCompare.params.x = questionFunc.params.x;
                    return forCompare.comparisons.equalByValueTo(questionFunc);
                } else if (correctFuncType === 'a') {
                    forCompare = new FunctionObj(questionFunc.funcType, correctFunc.copyParams());
                    forCompare.params.x = questionFunc.params.x;
                    forCompare.params.v = questionFunc.params.v;
                    return forCompare.comparisons.equalByValueTo(questionFunc);
                }
                break;
            case 'v':
                if (correctFuncType === 'x') {
                    forCompare = new FunctionObj(questionFunc.funcType, correctFunc.copyParams()).clearParams();
                    return forCompare.comparisons.equalByValueTo(questionFunc);
                } else if (correctFuncType === 'a') {
                    forCompare = new FunctionObj(questionFunc.funcType, correctFunc.copyParams());
                    forCompare.params.v = questionFunc.params.v;
                    return forCompare.comparisons.equalByValueTo(questionFunc);
                }
                break;

            case 'a':
                if (correctFuncType === 'x' || correctFuncType === 'v') {
                    forCompare = new FunctionObj(questionFunc.funcType, correctFunc.copyParams()).clearParams();
                    return forCompare.comparisons.equalByValueTo(questionFunc);
                }
                break;
        }
        return false;
    }

    private createIncorrectFunction(recursive_count?: number): FunctionObj {
        if (!recursive_count) recursive_count = 1;
        if (recursive_count > 100) throw Error('Too much recursive calls');


        const incorrectFunc = new FunctionObj(this.allowedAxes.getRandom()).generateParams().clearParams();

        for (const questionObj of this.usedQuestionObjects)
            if (incorrectFunc.comparisons.equalByValueTo(questionObj.func))
                return this.createIncorrectFunction(++recursive_count);

        for (const usedIncorrectFunc of this.usedIncorrectFuncs)
            if (incorrectFunc.comparisons.equalBySignTo(usedIncorrectFunc)
                || incorrectFunc.comparisons.equalByTextTo(usedIncorrectFunc))
                return this.createIncorrectFunction(++recursive_count);

        for (const usedCorrectFunc of this.usedCorrectFuncs)
            if (incorrectFunc.comparisons.equalByTextTo(usedCorrectFunc))
                return this.createIncorrectFunction(++recursive_count);

        incorrectFunc.params.len = this.functionLength;
        if (incorrectFunc.behaviour.isConvex() && recursive_count < 10)
            return this.createIncorrectFunction(++recursive_count);


        // snapEnd affects function what should not be affected
        return incorrectFunc.behaviour.snapEnd().getFuncObj();
    }

    private createComplexFunction(funcsLengths: Array<number>) {
        const defaultLength = Config.Limits.defaultLength,
            lowerLimit = Config.Limits.lowerLimit;
        let complexFunc: Array<FunctionObj>,
            cumLength = 0;

        for (const length of funcsLengths) {
            if (length < lowerLimit || length > length)
                throw Error('Length must be between ' + lowerLimit + ' and ' + length);
            cumLength += length
        }
        if (cumLength > defaultLength)
            throw Error('The sum of functions lengths values must be less than ' + defaultLength);


        complexFunc = Array<FunctionObj>();
        this.setLength(funcsLengths[0]);

        complexFunc.push(this.getQuestionFunction());

        for (let i = 1; i < funcsLengths.length; ++i) {
            this.setLength(funcsLengths[i]);
            complexFunc.push(this.createNextFunction(complexFunc.last()))
        }
        this.createNextFunction(complexFunc.last());

        return complexFunc;
    }

    private createNextFunction(prevFunc: FunctionObj, recursive_count?: number): FunctionObj {
        if (!recursive_count) recursive_count = 1;
        else if (recursive_count === 30) throw new Error('To much recursive calls.');
        if (!prevFunc.params.len) throw new Error("this.params.len is undefined");


        const funcType = prevFunc.funcType,
            nextFunc = new FunctionObj(funcType).generateParams().clearParams();
        let prevFuncValue: number;
        nextFunc.params.len = this.functionLength;

        // if (this.doSnap) prevFunc.snapBegin().snapEnd();
        // else prevFunc.snapEnd();

        prevFuncValue = prevFunc.values.calcFunctionValue();
        nextFunc.params[funcType] = prevFuncValue;
        nextFunc.behaviour.snapEnd();

        // if (Math.abs(nextFunc.params[funcType]) > Config.upperLimit)
        //     throw Error('nextFunc.params[funcType] greater than upperLimit');

        // if (nextFunc.calcFinalValue() > Config.upperLimit) {
        //     let params = nextFunc.params,
        //         first = params.x ? "x" : "v",
        //         second = params.v ? "v" : "a",
        //         third = params.a ? "a" : undefined;
        //     // FIXME:       V always on side of X
        //     if (nextFunc.params[second] !== 0)
        //         nextFunc.params[second] = -Math.sign(nextFunc.params[first]) * Math.abs(nextFunc.params[second]);
        //     if (third && nextFunc.params[third] !== 0)
        //     // FIXME:                 Math.sign(nextFunc.params[SECOND?????????]) to be opposite of V???
        //         nextFunc.params[third] = Math.sign(nextFunc.params[first]) * Math.abs(nextFunc.params[third]);
        // }


        if (nextFunc.comparisons.equalByDirectionTo(prevFunc))
            return this.createNextFunction(prevFunc, ++recursive_count);

        return nextFunc;
    }

}
