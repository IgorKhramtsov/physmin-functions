import {FunctionObj} from './FunctionObj'
import {Config} from "../Config";

type QuestionObj = {
    func: FunctionObj,
    axes: Array<string>,
};

export class FunctionBuilder {
    private usedQuestionFuncs = Array<FunctionObj>();
    private usedCorrectFuncs = Array<FunctionObj>();
    private usedIncorrectFuncs = Array<FunctionObj>();

    private functionLength = Config.Limits.defaultLength;
    private allowedAxes = Config.Axes.set;
    private useAllowedAxes = true;
    private allowDuplicateText = true;


    //------------------------------------
    // Builder properties
    //------------------------------------
    reset() {
        this.usedQuestionFuncs = Array<FunctionObj>();
        this.usedCorrectFuncs = Array<FunctionObj>();
        this.usedIncorrectFuncs = Array<FunctionObj>();

        this.functionLength = Config.Limits.defaultLength;
        this.allowedAxes = Config.Axes.set;
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
        if (axises.length <= 0) throw Error("Available axes array cant be empty!");

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
        this.allowedAxes = Config.getAxesCopy();
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
    
    // Actually this is simply a func with duplicate managment. not a 'question' func.
    getQuestionObj(): QuestionObj {
        const questionObject = this.createQuestionObject();
        this.usedQuestionFuncs.push(questionObject.func);

        return questionObject;
    }

    getCorrectFunction(questionObj: QuestionObj): FunctionObj {
        const correctFunction = this.createCorrectFunction(questionObj);
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
    private createQuestionObject(recursive_count = 1): QuestionObj {
        if (recursive_count > 100) throw Error('Too many recursive calls');

        const questionObj: QuestionObj = {
            func: new FunctionObj(this.allowedAxes.getRandom()).generateParams(),
            axes: Array<string>(),
        };
        questionObj.axes = Config.getAxesCopy([questionObj.func.funcType]);

        for (const func of this.usedQuestionFuncs)
            if (questionObj.func.comparisons.equalBySignTo(func) || 
                questionObj.func.comparisons.equalByTextTo(func))
                return this.createQuestionObject(++recursive_count);

        questionObj.func.params.len = this.functionLength;
        questionObj.func.behaviour.snapBegin().snapEnd();

        if (questionObj.func.behaviour.isConvex() && recursive_count < 30)
            return this.createQuestionObject(++recursive_count);

        return questionObj;
    }

    private createCorrectFunction(questionObj: QuestionObj, recursive_count = 1): FunctionObj {
        if (recursive_count > 100) throw Error('Too many recursive calls');

        let correctFunc: FunctionObj,
            pickedAxis: string,
            newParams: any;

        if (this.useAllowedAxes)
            pickedAxis = this.allowedAxes.getRandom();
        else {
            if (questionObj.axes.length === 0) throw Error('There are none of available axes left.');
            else pickedAxis = questionObj.axes.getRandom();
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
                return this.createCorrectFunction(questionObj, ++recursive_count);

        for (const usedIncorrectFunc of this.usedIncorrectFuncs)
            if (correctFunc.comparisons.equalByTextTo(usedIncorrectFunc) && recursive_count < 20)
                return this.createCorrectFunction(questionObj, ++recursive_count);

        correctFunc.params.len = this.functionLength;
        if (correctFunc.behaviour.isConvex() && recursive_count < 10)
            return this.createCorrectFunction(questionObj, ++recursive_count);



        // snapEnd affects function what should not be affected
        correctFunc = correctFunc.behaviour.snapEnd().getFuncObj();

        if (correctFunc.behaviour.isConvex() && recursive_count < 10)
            return this.createCorrectFunction(questionObj, ++recursive_count);

        if (!this.useAllowedAxes) questionObj.axes.deleteItem(pickedAxis);
        return correctFunc;
    }


    private createIncorrectFunction(recursive_count = 1): FunctionObj {
        if (recursive_count > 100) throw Error('Too many recursive calls');

        let incorrectFunc: FunctionObj;
        if(this.useAllowedAxes)
            incorrectFunc = new FunctionObj(this.allowedAxes.getRandom()).generateParams();
        else
            incorrectFunc = new FunctionObj(Config.Axes.set.getRandom()).generateParams();

        for (const func of this.usedQuestionFuncs)
            if (incorrectFunc.comparisons.equalByValueTo(func))
                return this.createIncorrectFunction(++recursive_count);

        for (const func of this.usedIncorrectFuncs)
            if (incorrectFunc.comparisons.equalBySignTo(func) || 
                incorrectFunc.comparisons.equalByTextTo(func))
                return this.createIncorrectFunction(++recursive_count);

        for (const func of this.usedCorrectFuncs)
            if (incorrectFunc.comparisons.equalByTextTo(func))
                return this.createIncorrectFunction(++recursive_count);

        incorrectFunc.params.len = this.functionLength;


        // snapEnd affects function what should not be affected
        incorrectFunc.behaviour.snapEnd();

        if (incorrectFunc.behaviour.isConvex() && recursive_count < 10)
            return this.createIncorrectFunction(++recursive_count);
        return incorrectFunc;
    }

    private createComplexFunction(funcsLengths: Array<number>) {
        const defaultLength = Config.Limits.defaultLength,
            minimumLength = Config.Limits.minimumLength,
            savedLength = this.functionLength,
            complexFunc = Array<FunctionObj>();
        let cumLength = 0;

        for (const length of funcsLengths) {
            if (length < minimumLength || length > defaultLength)
                throw Error('Length must be between ' + minimumLength + ' and ' + defaultLength);
            cumLength += length
        }
        if (cumLength > defaultLength)
            throw Error('The sum of functions lengths values greater than ' + defaultLength);

        this.setLength(funcsLengths[0]);
        complexFunc.push(this.getQuestionObj().func); // Start of complex function is questionFunc, so we doesnt need to care about duplicates
        for (let i = 1; i < funcsLengths.length; ++i) {
            complexFunc.push(this.createNextFunction(complexFunc.last(), funcsLengths[i]))
        }

        this.setLength(savedLength);
        return complexFunc;
    }

    private createNextFunction(prevFunc: FunctionObj, nextFuncLen = this.functionLength, recursive_count: number = 1): FunctionObj {
        if (recursive_count > 30) throw new Error('Too many recursive calls');
        if (!prevFunc.params.len) throw new Error("this.params.len is undefined");


        const   funcType = prevFunc.funcType,
                nextFunc = new FunctionObj(funcType).generateParams();
        let     prevFuncValue: number;
        nextFunc.params.len = nextFuncLen;

        prevFuncValue = prevFunc.values.calcFinalValue();
        nextFunc.params[funcType] = prevFuncValue;
        nextFunc.behaviour.snapEnd();


        if (nextFunc.comparisons.equalByDirectionTo(prevFunc))
            return this.createNextFunction(prevFunc, nextFuncLen, ++recursive_count);

        return nextFunc;
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
}
