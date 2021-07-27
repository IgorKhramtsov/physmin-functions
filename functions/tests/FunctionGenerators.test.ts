import { FunctionBuilder} from "../src/Function/FunctionBuilder";
import { FunctionObj } from "../src/Function/FunctionObj";
import { Config } from "../src/Config";
import chai = require('chai');

describe("Function generators", () => {
    it("getIncorrect. Checking fullness of incorrect generator variations", () => {
        let builder = new FunctionBuilder(),
            question: FunctionObj,
            incorrect_array = Array<FunctionObj>(),
            counter = 0;

        question = builder.getQuestionFunction(['x']);
        counter = 0;
        while (true) {
            try {
                incorrect_array.push(builder.getIncorrectFunction(question));
                chai.expect(++counter,"exception not throwed").to.be.lessThan(100);
            }
            catch {
                break;
            }
        }
        chai.expect(incorrect_array.length).to.be.equal(10);

        incorrect_array = Array<FunctionObj>();
        builder.reset();
        question = builder.getQuestionFunction(['v']);
        counter = 0;
        while (true) {
            try {
                incorrect_array.push(builder.getIncorrectFunction(question));
                chai.expect(++counter,"exception not throwed").to.be.lessThan(100);
            }
            catch {
                break;
            }
        }
        chai.expect(incorrect_array.length).to.be.equal(26);

        incorrect_array = Array<FunctionObj>();
        builder.reset();
        question = builder.getQuestionFunction(['a']);
        counter = 0;
        while (true) {
            try {
                incorrect_array.push(builder.getIncorrectFunction(question));
                chai.expect(++counter,"exception not throwed").to.be.lessThan(100);
            }
            catch {
                break;
            }
        }
        chai.expect(incorrect_array.length).to.be.equal(24);
    });

    it("getCorrectFunction. Correct funcType", () => {
        let correct_array: any,
            question: FunctionObj,
            builder: FunctionBuilder;
        for (let i = 0; i < 100; i++) {
            builder = new FunctionBuilder();
            builder.setLength(0);
            builder.setAllowedAxes(['x']);
            question = builder.getQuestionFunction();
            correct_array = Array<FunctionObj>();

            builder.setAllowedAxes(['v']);
            correct_array.push(builder.getCorrectFunction(question));
            builder.setAllowedAxes(['a']);
            correct_array.push(builder.getCorrectFunction(question));

            chai.expect(correct_array[0].funcType).to.be.equal("v");
            chai.expect(correct_array[1].funcType).to.be.equal("a");
        }
    });
    it("getCorrectFunction. Generated functions should be Correct", () => {
        let builder: FunctionBuilder,
            question: FunctionObj,
            correctFunctionToCompare: FunctionObj,
            correct_array: any;
        for (let i = 0; i < 100; i++) {
            builder = new FunctionBuilder();
            question = builder.getQuestionFunction(['x']);

            correct_array = Array<FunctionObj>();

            builder.setAllowedAxes(['x', 'v']);
            correct_array.push(builder.getCorrectFunction(question));
            builder.setAllowedAxes(['x', 'v', 'a']);
            correct_array.push(builder.getCorrectFunction(question));

            correctFunctionToCompare = new FunctionObj(question.funcType, correct_array[0].copyParams());
            correctFunctionToCompare.params.x = question.params.x;
            chai.expect(correctFunctionToCompare.comparisons.equalBySignTo(question)).to.be.true;

            correctFunctionToCompare = new FunctionObj(question.funcType, correct_array[1].copyParams());
            correctFunctionToCompare.params.x = question.params.x;
            correctFunctionToCompare.params.v = question.params.v;
            chai.expect(correctFunctionToCompare.comparisons.equalBySignTo(question)).to.be.true;
        }
    });
    it("getCorrectFunction. Checking fullness of correct generator variations", () => {
        let builder = new FunctionBuilder(),
            question: FunctionObj,
            correct_array = Array<FunctionObj>(),
            counter = 0;

        question = builder.getQuestionFunction(['x']);
        counter = 0;
        while (true) {
            try {
                correct_array.push(builder.getCorrectFunction(question));
                chai.expect(++counter,"exception not throwed").to.be.lessThan(100);
            }
            catch {
                break;
            }
        }
        chai.expect(correct_array.length).to.be.equal(2);
        correct_array = Array<FunctionObj>();
        builder.reset();
        question = builder.getQuestionFunction(['v']);
        counter = 0;
        while (true) {
            try {
                correct_array.push(builder.getCorrectFunction(question));
                chai.expect(++counter,"exception not throwed").to.be.lessThan(100);
            }
            catch {
                break;
            }
        }
        chai.expect(correct_array.length).to.be.equal(4);

        correct_array = Array<FunctionObj>();
        builder.reset();
        question = builder.getQuestionFunction(['a']);
        counter = 0;
        while (true) {
            try {
                correct_array.push(builder.getCorrectFunction(question));
                chai.expect(++counter,"exception not throwed").to.be.lessThan(100);
            }
            catch {
                break;
            }
        }
        chai.expect(correct_array.length).to.be.equal(12);
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
