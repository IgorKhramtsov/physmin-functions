import {FunctionBuilder} from "../src/Function/FunctionBuilder";
import {FunctionObj} from "../src/Function/FunctionObj";
import {Config} from "../src/Config";
import chai = require('chai');

describe("Function generators", () => {
    it('getQuestionFunction. Should not throw any exceptions', () => {
        let builder: any = new FunctionBuilder();
        for (let i = 0; i < 100; ++i) {
            builder.reset();
            chai.expect(() => builder.getQuestionFunction()).to.not.throw(Error);
        }
    });
    it('getIncorrectFunction. Functions must not be equal to Questions and Correct functions', () => {
        let builder = new FunctionBuilder(),
            correctFuncArray: Array<FunctionObj>,
            incorrectFuncArray: Array<FunctionObj>,
            questionFuncArray: Array<FunctionObj>,
            incorrectFunc: FunctionObj;
        for (let i = 0; i < 100; ++i) {
            builder.reset();
            correctFuncArray = [];
            questionFuncArray = [];
            incorrectFuncArray = [];

            builder.disableAllowedAxesUsage();
            for (let j = 0; j < 4; ++j) {
                questionFuncArray.push(builder.getQuestionFunction());
                correctFuncArray.push(builder.getCorrectFunction());
            }

            for (let j = 0; j < 2; ++j) {
                incorrectFunc = builder.getIncorrectFunction();
                for (let questionFunc of questionFuncArray)
                    chai.expect(incorrectFunc.comparisons.equalByValueTo(questionFunc)).to.be.false;
                for (let correctFunc of correctFuncArray)
                    chai.expect(incorrectFunc.comparisons.equalByTextTo(correctFunc)).to.be.false;
                for (let incorrect_func of incorrectFuncArray)
                    chai.expect(incorrectFunc.comparisons.equalBySignTo(incorrect_func)).to.be.false;
                incorrectFuncArray.push(incorrectFunc)
            }
        }
    });

    it("getCorrectFunction. Correct funcType", () => {
        let correct_array: any,
            builder: any;
        for (let i = 0; i < 100; i++) {
            builder = new FunctionBuilder();
            builder.setLength(0);
            builder.setAllowedAxes(['x']);
            builder.getQuestionFunction();
            correct_array = Array<FunctionObj>();

            builder.setAllowedAxes(['v']);
            correct_array.push(builder.getCorrectFunction());
            builder.setAllowedAxes(['a']);
            correct_array.push(builder.getCorrectFunction());

            chai.expect(correct_array[0].funcType).to.be.equal("v");
            chai.expect(correct_array[1].funcType).to.be.equal("a");
        }
    });
    it("getCorrectFunction. Generated functions should be Correct", () => {
        let builder: any,
            question: any,
            correctFunctionToCompare: FunctionObj,
            correct_array: any;
        for (let i = 0; i < 100; i++) {
            builder = new FunctionBuilder();
            builder.setAllowedAxes(['x']);
            question = builder.getQuestionFunction();

            correct_array = Array<FunctionObj>();

            builder.setAllowedAxes(['x', 'v']);
            correct_array.push(builder.getCorrectFunction());
            builder.setAllowedAxes(['x', 'v', 'a']);
            correct_array.push(builder.getCorrectFunction());

            correctFunctionToCompare = new FunctionObj(question.funcType, correct_array[0].copyParams());
            correctFunctionToCompare.params.x = question.params.x;
            chai.expect(correctFunctionToCompare.comparisons.equalBySignTo(question)).to.be.true;

            correctFunctionToCompare = new FunctionObj(question.funcType, correct_array[1].copyParams());
            correctFunctionToCompare.params.x = question.params.x;
            correctFunctionToCompare.params.v = question.params.v;
            chai.expect(correctFunctionToCompare.comparisons.equalBySignTo(question)).to.be.true;
        }
    });

    it('Complex Function. Functions should connect', () => {
        let builder = new FunctionBuilder(),
            complexFunction: Array<FunctionObj>,
            funcLength: number = Config.Limits.defaultLength / 2,
            prevEnd: number,
            nextStart: number;
        for (let i = 0; i < 100; ++i) {
            builder.reset();

            complexFunction = builder.getComplexFunction([funcLength, funcLength]);
            prevEnd = complexFunction[0].values.calcFinalValue();
            nextStart = complexFunction[1].params[complexFunction[1].funcType];
            chai.expect(prevEnd).to.be.equal(nextStart);
        }
    });
    it('Complex Function. Last function must not cross limit lines', () => {
        let builder: FunctionBuilder = new FunctionBuilder(),
            lastFunc: FunctionObj,
            funcLength: number = Config.Limits.defaultLength / 2;
        for (let i = 0; i < 100; ++i) {
            builder.reset();
            lastFunc = builder.getComplexFunction([funcLength, funcLength]).last();
            chai.expect(Math.abs(lastFunc.values.calcFinalValue(funcLength))).to.be.at.most(Config.Limits.upperLimit);
        }
    });
});
