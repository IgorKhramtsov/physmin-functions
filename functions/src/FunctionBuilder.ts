import {FunctionObj} from './FunctionObj'
import {Config} from "./Config";
import {Utils} from './Util';

export class FunctionBuilder {
    private usedQuestionFuncs: Array<any>;
    private usedCorrectFuncs: Array<FunctionObj>;
    private usedIncorrectFuncs: Array<FunctionObj>;

    private isSnapping: boolean;
    private functionLength: number;
    private availableAxises: Array<string>;

    constructor() {
        this.usedQuestionFuncs = Array<any>();
        this.usedCorrectFuncs = Array<FunctionObj>();
        this.usedIncorrectFuncs = Array<FunctionObj>();

        this.isSnapping = false;
        this.functionLength = Config.defaultLength;
        this.availableAxises = Config.axisIndexes;
    }

    // -----------------------------------------------------------------------------
    enableSnap() {
        this.isSnapping = true;
    }

    disableSnap() {
        this.isSnapping = false;
    }

    reset() {
        FunctionBuilder.constructor();

        return this;
    }

    setLength(length: number) {
        if (length < 0 || length > Config.defaultLength)
            throw Error('Parameter <functionLength> must be in [0,' + Config.defaultLength + '].')
        else if (length === 0)
            this.functionLength = Config.defaultLength;
        else
            this.functionLength = length;

        return this;
    }

    setAvailableAxieses(axises: Array<string>) {
        if (axises.length <= 0)
            throw Error("Available axises array cant be empty!");

        this.availableAxises = axises.copy();
    }

    getAvailableAxises() {
        return this.availableAxises.copy();
    }

    resetAvailableAxises() {
        this.availableAxises = Config.axisIndexes.copy();
    }

    // -----------------------------------------------------------------------------
    getQuestionFunction(): FunctionObj {
        let question = this.createQuestionFunction();
        this.usedQuestionFuncs.push(question);

        return question.func;
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

    // -----------------------------------------------------------------------------
    private createQuestionFunction(): any {

        let question = {
            func: new FunctionObj(this.availableAxises.getRandom())
                .generateParams().clearParams(),
            axises: this.getAvailableAxises()
        };

        if (this.usedQuestionFuncs.length !== 0)
            for (const usedQuestion of this.usedQuestionFuncs)
                if (question.func.equalTo(usedQuestion.func))
                    return this.createQuestionFunction();

        question.func.params.len = this.functionLength;

        if(question.func.isConvex())
            return this.createQuestionFunction();

        if (this.isSnapping)
            question.func = question.func.snapToGrid();
        return question;
    }

    private createCorrectFunction(): FunctionObj {
        let question: any;

        if (this.usedQuestionFuncs.length === 0)
            throw Error("There are none of question function");

        question = this.usedQuestionFuncs.last();

        if (question.axises.length === 0)
            throw Error('There are none of available axises left.');

        const pickedAxis = question.axises.getRandom(),
            newParams = question.func.copyParams(),
            correctFunction = new FunctionObj(pickedAxis, newParams).makeCorrectParams().clearParams();

        correctFunction.params.len = this.functionLength;
        if(correctFunction.isConvex())
            return this.createCorrectFunction();

        question.axises.deleteItem(pickedAxis);

        return this.isSnapping ? correctFunction.snapToGrid() : correctFunction;
    }

    private createIncorrectFunction(): FunctionObj {
        if (this.usedQuestionFuncs.length === 0)
            throw Error("There are none of question function");

        const question = this.usedQuestionFuncs.getRandom(),
            pickedAxis = this.availableAxises.getRandom(),
            newParams = question.func.copyParams(),
            incorrectFunction = new FunctionObj(pickedAxis, newParams).makeIncorrectParams().clearParams();

        // TODO: Need to check is this func incorrect to every question function

        if (this.usedIncorrectFuncs.length !== 0)
            for (const func of this.usedIncorrectFuncs)
                if (incorrectFunction.equalTo(func))
                    return this.createIncorrectFunction();

        if(this.usedCorrectFuncs.length !== 0)
            for(const func of this.usedCorrectFuncs)
                if(incorrectFunction.equalByText(func))
                    return this.createIncorrectFunction();

        incorrectFunction.params.len = this.functionLength;
        if(incorrectFunction.isConvex())
            return this.createIncorrectFunction();

        return this.isSnapping ? incorrectFunction.snapToGrid() : incorrectFunction;
    }

    private createComplexFunction(functionsLengths: Array<number>) {

        let count = 0;
        for (const length of functionsLengths) {
            if (length < Config.minLength || length > Config.defaultLength)
                throw Error('Length must be between ' + Config.minLength + ' and ' + Config.defaultLength);
            count += length
        }

        if (count > Config.defaultLength)
            throw Error('The sum of functions lengths values must be less than ' + Config.defaultLength);

        let complexFunction = Array<FunctionObj>();
        this.getQuestionFunction();
        this.setLength(functionsLengths[0]);

        complexFunction.push(this.createCorrectFunction());
        for (let i = 1; i < functionsLengths.length; ++i) {
            this.setLength(functionsLengths[i]);
            complexFunction.push(this.createNextFunction(complexFunction.last(), complexFunction))
        }

        return complexFunction;
    }

    private createNextFunction(prevFunc: FunctionObj, usedFunctions?: Array<FunctionObj>, recursive_count?: number): FunctionObj {

        const funcType = prevFunc.funcType,
            nextFunc = new FunctionObj(funcType).generateParams().clearParams();

        if (!recursive_count) recursive_count = 1;
        else if (recursive_count === 30) throw new Error('To much recursive calls.');

        nextFunc.params.len = this.functionLength;

        if (this.isSnapping)
            prevFunc.snapToGrid();

        if (!prevFunc.params.len) throw new Error("this.params.len is undefined");
        // nextFunc.params[funcType] = Math.round(prevFunc.calculateFunctionValue());
        nextFunc.params[funcType] = prevFunc.calculateFunctionValue();

        if ((nextFunc.params[funcType] >= Config.upperLimit ) ||
            (nextFunc.calculateFunctionValue() >= Config.upperLimit)) {

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

        if (usedFunctions) {
            if (nextFunc.equalToByDirection(usedFunctions.last()))
                return this.createNextFunction(prevFunc, usedFunctions, ++recursive_count);
            //         return this.createNextFunction(prevFunc, usedFunctions, ++recursive_count);
            // for (const func of usedFunctions){
            //     //byDir
            //     console.log(nextFunc.params.x, nextFunc.params.v, nextFunc.params.a)
            //     console.log(func.params.x, func.params.v, func.params.a)
            //     console.log('===================')
            //
            //     if (nextFunc.equalToByDirection(func))
            //         return this.createNextFunction(prevFunc, usedFunctions, ++recursive_count);
            // }
            // if (nextFunc.equalToByDirection(usedFunctions.last())) {
            //   return this.createNextFunction(usedFunctions, len, ++recursive_count);
            // }
        }

        return nextFunc;
    }
}
