import {FunctionObj} from './FunctionObj'
import {Config} from "./Config";

export class FunctionBuilder {
    private usedQuestionObjects = Array<any>();
    private usedCorrectFuncs= Array<FunctionObj>();
    private usedIncorrectFuncs = Array<FunctionObj>();

    private doSnap = false;
    private functionLength =  Config.defaultLength;
    private allowedAxes= Config.Axes;
    private useAllowedAxes= true;


    reset() {
        this.usedQuestionObjects = Array<any>();
        this.usedCorrectFuncs = Array<FunctionObj>();
        this.usedIncorrectFuncs = Array<FunctionObj>();

        this.doSnap = false;
        this.functionLength = Config.defaultLength;
        this.allowedAxes = Config.Axes;
        this.useAllowedAxes = true;
    }

    setLength(length: number) {
        if (length < 0 || length > Config.defaultLength)
            throw Error('Parameter <functionLength> must be in [0,' + Config.defaultLength + '].');
        else if (length === 0)
            this.functionLength = Config.defaultLength;
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
        this.allowedAxes = Config.Axes.copy();
    }

    enableSnap() {
        this.doSnap = true;
    }

    disableSnap() {
        this.doSnap = false;
    }


    getQuestionFunction(): FunctionObj {
        let questionObject = this.createQuestionObject();
        this.usedQuestionObjects.push(questionObject);

        return questionObject.func;
    }

    getCorrectFunction(): FunctionObj {
        let correctFunction = this.createCorrectFunction();
        this.usedCorrectFuncs.push(correctFunction);

        return correctFunction;
    }

    getIncorrectFunction(): FunctionObj {
        let incorrectFunction = this.createIncorrectFunction();
        this.usedIncorrectFuncs.push(incorrectFunction);

        return incorrectFunction;
    }

    getComplexFunction(functionsLengths: Array<number>): Array<FunctionObj> {
        return this.createComplexFunction(functionsLengths);
    }


    private createQuestionObject(recursive_count?: number): any {
        if (!recursive_count) recursive_count = 1;
        if (recursive_count > 100) throw Error('Too much recursive calls');


        let questionObj = {
            func: new FunctionObj(this.allowedAxes.getRandom()).generateParams().clearParams(),
            axises: {}
        };
        questionObj.axises = Config.Axes.copy().deleteItem(questionObj.func.funcType);

        for (const obj of this.usedQuestionObjects)
            if (questionObj.func.equalBySignTo(obj.func) || questionObj.func.equalByTextTo(obj.func))
                return this.createQuestionObject(++recursive_count);

        questionObj.func.params.len = this.functionLength;
        if (questionObj.func.isConvex() && recursive_count < 10)
            return this.createQuestionObject(++recursive_count);

        if (this.doSnap) questionObj.func.snapToGrid().limitValues();
        else questionObj.func.limitValues();

        return questionObj;
    }

    private createCorrectFunction(recursive_count?: number): FunctionObj {
        if (!recursive_count) recursive_count = 1;
        if (recursive_count > 100) throw Error('Too much recursive calls');
        if (this.usedQuestionObjects.length === 0) throw Error("There are none of question function");


        let questionObj = this.usedQuestionObjects.last(),
            correctFunc: FunctionObj,
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

        for (const usedIncorrectFunc of this.usedIncorrectFuncs)
            if (correctFunc.equalByTextTo(usedIncorrectFunc))
                return this.createCorrectFunction(++recursive_count);

        correctFunc.params.len = this.functionLength;
        if (correctFunc.isConvex() && recursive_count < 10)
            return this.createCorrectFunction(++recursive_count);

        if (this.useAllowedAxes === false) questionObj.axises.deleteItem(pickedAxis);

        if (this.doSnap) correctFunc.snapToGrid().limitValues();
        else correctFunc.limitValues();

        return correctFunc;
    }

    private createIncorrectFunction(recursive_count?: number): FunctionObj {
        if (!recursive_count) recursive_count = 1;
        if (recursive_count > 100) throw Error('Too much recursive calls');


        const incorrectFunc: FunctionObj = new FunctionObj(this.allowedAxes.getRandom()).generateParams().clearParams();

        for (const questionObj of this.usedQuestionObjects)
            if (incorrectFunc.equalByValueTo(questionObj.func))
                return this.createIncorrectFunction(++recursive_count);

        for (const usedIncorrectFunc of this.usedIncorrectFuncs)
            if (incorrectFunc.equalBySignTo(usedIncorrectFunc))
                return this.createIncorrectFunction(++recursive_count);

        for (const usedCorrectFunc of this.usedCorrectFuncs)
            if (incorrectFunc.equalByTextTo(usedCorrectFunc))
                return this.createIncorrectFunction(++recursive_count);

        incorrectFunc.params.len = this.functionLength;
        if (incorrectFunc.isConvex() && recursive_count < 10)
            return this.createIncorrectFunction(++recursive_count);

        if (this.doSnap) incorrectFunc.snapToGrid().limitValues();
        else incorrectFunc.limitValues();

        return incorrectFunc;
    }

    private createComplexFunction(funcsLengths: Array<number>) {
        let cumLength = 0,
            complexFunc: Array<FunctionObj>;

        for (const length of funcsLengths) {
            if (length < Config.lowerLimit || length > Config.defaultLength)
                throw Error('Length must be between ' + Config.lowerLimit + ' and ' + Config.defaultLength);
            cumLength += length
        }
        if (cumLength > Config.defaultLength)
            throw Error('The sum of functions lengths values must be less than ' + Config.defaultLength);


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


        const funcType= prevFunc.funcType,
            nextFunc = new FunctionObj(funcType).generateParams().clearParams();
        let prevFuncValue: number;
        nextFunc.params.len = this.functionLength;

        if (this.doSnap) prevFunc.snapToGrid().limitValues();
        else prevFunc.limitValues();

        prevFuncValue = prevFunc.calcFunctionValue();
        nextFunc.params[funcType] = prevFuncValue;

        if (Math.abs(nextFunc.params[funcType]) > Config.upperLimit)
            throw Error('nextFunc.params[funcType] greater than upperLimit');

        if (nextFunc.calcFunctionValue() > Config.upperLimit) {
            let params = nextFunc.params,
                first = params.x ? "x" : "v",
                second = params.v ? "v" : "a",
                third = params.a ? "a" : undefined;
            // FIXME:       V always on side of X
            if (nextFunc.params[second] !== 0)
                nextFunc.params[second] = -Math.sign(nextFunc.params[first]) * Math.abs(nextFunc.params[second]);
            if (third && nextFunc.params[third] !== 0)
            // FIXME:                 Math.sign(nextFunc.params[SECOND?????????]) to be opposite of V???
                nextFunc.params[third] = Math.sign(nextFunc.params[first]) * Math.abs(nextFunc.params[third]);
        }

        if (nextFunc.equalByDirectionTo(prevFunc))
            return this.createNextFunction(prevFunc, ++recursive_count);

        return nextFunc;
    }

}
