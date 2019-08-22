import chai = require('chai');
import {FunctionObj} from "../src/FunctionObj";
import {Config} from "../src/Config";
import {UnitFirst as tests} from "../src/UnitFirst"
import {FunctionBuilder} from "../src/FunctionBuilder";

function checkCorrectFunc(questionFunc: FunctionObj, correctFunc: FunctionObj) {
    const forCompare = new FunctionObj(questionFunc.funcType, correctFunc.copyParams()).clearParams();
    return questionFunc.equalByValueTo(forCompare)
}


describe("Test generators", () => {
    it("Graph to Graph(1 answer) should not throws any exceptions", () => {
        for (let i = 0; i < 200; i++)
            chai.expect(() => tests.getG2Gtest_OneAnswerGraph(2)).to.not.throw(Error);
    });
    it("Graph to Graph(2 answers) should not throws any exceptions", () => {
        for (let i = 0; i < 200; i++)
            chai.expect(() => tests.getG2Gtest_TwoAnswerGraph(0)).to.not.throw(Error);
    });
    it("Graph to State(simple graphs) should not throws any exceptions", () => {
        for (let i = 0; i < 200; i++)
            chai.expect(() => tests.getG2Stest_SimpleFunctions(4)).to.not.throw(Error);
    });
    it("Graph to State(complex graphs) should not throws any exceptions", () => {
        for (let i = 0; i < 200; i++)
            chai.expect(() => tests.getG2Stest_ComplexFunctions(4)).to.not.throw(Error);
    });
    it("Graph to State(mixed 0-99%) should not throws any exceptions", () => {
        for (let i = 0; i < 100; i++)
            chai.expect(() => tests.getG2Stest_MixedFunctions(4, i / 10.0)).to.not.throw(Error);
    });

    it('Sign to Graph(simple answers) shoud not throw any exceptions.', () => {
        for (let i = 0; i < 100; i++) {
            chai.expect(() => tests.getSGtest_SimpleAnswers(0)).to.not.throw(Error);
        }
    });
    it('Sign to Graph(complex answers) shoud not throw any exceptions.', () => {
        for (let i = 0; i < 100; i++) {
            chai.expect(() => tests.getSGtest_ComplexAnswers(0)).to.not.throw(Error);
        }
    })
});

describe("Function generators", () => {
    it('getQuestionFunction. Should not throw any exceptions', () => {
        let funcBuilder: any = new FunctionBuilder();
        for (let i = 0; i < 100; ++i) {
            funcBuilder.reset();
            chai.expect(() => funcBuilder.getQuestionFunction()).to.not.throw(Error);
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
                    chai.expect(incorrectFunc.equalByValueTo(questionFunc)).to.be.false;
                for (let correctFunc of correctFuncArray)
                    chai.expect(incorrectFunc.equalByTextTo(correctFunc)).to.be.false;
                for (let incorrect_func of incorrectFuncArray)
                    chai.expect(incorrectFunc.equalBySignTo(incorrect_func)).to.be.false;
                incorrectFuncArray.push(incorrectFunc)
            }
        }
    });
    it("getCorrectFunction. Correct funcType", () => {
        let correct_array: any,
            funcBuilder: any;
        for (let i = 0; i < 100; i++) {
            funcBuilder = new FunctionBuilder();
            funcBuilder.setLength(0);
            funcBuilder.setAllowedAxes(['x']);
            funcBuilder.getQuestionFunction();
            correct_array = Array<FunctionObj>();

            funcBuilder.setAllowedAxes(['v']);
            correct_array.push(funcBuilder.getCorrectFunction());
            funcBuilder.setAllowedAxes(['a']);
            correct_array.push(funcBuilder.getCorrectFunction());

            chai.expect(correct_array[0].funcType).to.be.equal("v");
            chai.expect(correct_array[1].funcType).to.be.equal("a");
        }
    });

    it('Complex Function. Functions should connect', () => {
        let funcBuilder: FunctionBuilder = new FunctionBuilder(),
            complexFunction: Array<FunctionObj>,
            funcLength = Config.defaultLength / 2,
            prevEnd: number,
            nextStart: number;
        for (let i = 0; i < 100; ++i) {
            funcBuilder.reset();
            complexFunction = funcBuilder.getComplexFunction([funcLength, funcLength]);
            prevEnd = complexFunction[0].calcFunctionValue();
            nextStart = complexFunction[1].params[complexFunction[1].funcType];
            chai.expect(prevEnd).to.be.equal(nextStart);
        }
    });
    it('Complex Function. Last function must not cross limit lines', () => {
        let funcBuilder: FunctionBuilder = new FunctionBuilder(),
            lastFunc: FunctionObj,
            funcLength: number = Config.defaultLength / 2;
        for (let i = 0; i < 100; ++i) {
            funcBuilder.reset();
            lastFunc = funcBuilder.getComplexFunction([funcLength, funcLength]).last();
            chai.expect(Math.abs(lastFunc.calcFunctionValue(funcLength))).to.be.at.most(Config.upperLimit);
        }
    });

    it("getCorrectFunction. Generated functions should be Correct", () => {
        let funcBuilder: any,
            question: any,
            correctFunctionToCompare: FunctionObj,
            correct_array: any;
        for (let i = 0; i < 100; i++) {
            funcBuilder = new FunctionBuilder();
            funcBuilder.setAllowedAxes(['x']);
            question = funcBuilder.getQuestionFunction();

            correct_array = Array<FunctionObj>();

            funcBuilder.setAllowedAxes(['x', 'v']);
            correct_array.push(funcBuilder.getCorrectFunction());
            funcBuilder.setAllowedAxes(['x', 'v', 'a']);
            correct_array.push(funcBuilder.getCorrectFunction());

            correctFunctionToCompare = new FunctionObj(question.funcType, correct_array[0].copyParams());
            correctFunctionToCompare.params.x = question.params.x;
            chai.expect(correctFunctionToCompare.equalBySignTo(question)).to.be.true;

            correctFunctionToCompare = new FunctionObj(question.funcType, correct_array[1].copyParams());
            correctFunctionToCompare.params.x = question.params.x;
            correctFunctionToCompare.params.v = question.params.v;
            chai.expect(correctFunctionToCompare.equalBySignTo(question)).to.be.true;
        }
    });
    it("getCorrectFunction, getIncorrectFunction. Generated functions should not going out of bounds", () => {
        let question: any,
            funcBuilder = new FunctionBuilder(),
            func: FunctionObj;
        for (let i = 0; i < 100; i++) {
            funcBuilder.reset();
            funcBuilder.setAllowedAxes(['x']);
            question = funcBuilder.getQuestionFunction();

            func = funcBuilder.getCorrectFunction();
            for (const param of Object.keys(func.params).deleteItem("len"))
                chai.expect(Math.abs(func.params[param])).to.be.lessThan(Config.upperLimit)

            func = funcBuilder.getIncorrectFunction();
            for (const param of Object.keys(func.params).deleteItem("len"))
                chai.expect(Math.abs(func.params[param])).to.be.lessThan(Config.upperLimit)
        }
    });

    it('generateParams. Generated params should not be all zeros', () => {
        let func: any;
        for (let i = 0; i < 100; ++i) {
            func = new FunctionObj().generateParams();
            chai.expect(func.params).to.be.not.equal({x: 0, v: 0, a: 0});
        }
    })
});

describe('Minor functions', () => {
    it('createNextFunction. Should not throw any exceptions.', () => {
        let funcBuilder: any,
        funcLength = Config.defaultLength / 2;
        for (let i = 0; i < 100; ++i) {
            funcBuilder = new FunctionBuilder();
            chai.expect(() => funcBuilder.getComplexFunction([funcLength, funcLength])).to.not.throw(Error);
        }
    });
    it('getTextDescription should not throw any exceptions.', () => {
        let func: any,
            funcBuilder: any;
        for (let i = 0; i < 100; ++i) {
            funcBuilder = new FunctionBuilder();
            funcBuilder.getQuestionFunction();
            func = funcBuilder.getCorrectFunction();
            chai.expect(() => func.getTextDescription(false)).to.not.throw(Error);
        }
    });
    it('limitValues should not throw any exceptions.', () => {
        let funcBuilder: any;
        for (let i = 0; i < 100; i++) {
            funcBuilder = new FunctionBuilder();
            funcBuilder.setLength(Config.defaultLength / 2);
            chai.expect(() => funcBuilder.getCorrectFunction).to.not.throw(Error);
        }
    });
    it('createNextCoupleIndexes should not throw any exceptions.', () => {
        let indexes = Array<Array<Array<number>>>(),
            questionCount = 5;
        for (let i = 0; i < 100; i++)
            chai.expect(() => FunctionObj.createNextCoupleIndexes(questionCount, indexes)).to.not.throw(Error);
    });
    it('createNextIndex should not throw any exceptions.', () => {
        let leftCoupleIndexes: any,
            questionCount = 6;

        for (let i = 0; i < 100; i++) {
            chai.expect(() => leftCoupleIndexes = FunctionObj.createNextIndex(questionCount)).to.not.throw(Error);
            chai.expect(() => FunctionObj.createNextIndex(questionCount, [leftCoupleIndexes])).to.not.throw(Error)
        }
    })
});

describe('Tests correctness, COMPOSITION', () => {
    it.only('getG2Gtest_OneAnswerGraph. 1 question, 1 correct answer, 3 incorrect answers', () => {
        let test: any,
            expectedCorrectFuncCount = 1,
            questionCount = 1,
            correctIDsCount = 1,
            realCorrectFuncCount = 0,
            answersCount = Config.answerCount;
        for (let i = 0; i < 10; i++) {
            test = tests.getG2Gtest_OneAnswerGraph(0);
            chai.expect(test.question.graph.length).to.be.equal(questionCount);
            chai.expect(test.question.correctIDs.length).to.be.equal(correctIDsCount);
            chai.expect(test.answers.length).to.be.equal(answersCount);

            realCorrectFuncCount = 0;
            for (let answer of test.answers)
                if (checkCorrectFunc(test.question.graph[0], answer.graph[0]))
                    realCorrectFuncCount++;
            chai.expect(realCorrectFuncCount).to.be.equal(expectedCorrectFuncCount);
        }
    });
    it('getG2Gtest_TwoAnswerGraph. 1 question, 2 correct answer, 2 incorrect answers', () => {
        let test: any;
        for (let i = 0; i < 100; i++) {
            test = tests.getG2Gtest_TwoAnswerGraph(0);
            chai.expect(test.question.graph.length).to.be.equal(1);
            chai.expect(test.question.correctIDs.length).to.be.equal(2);
            chai.expect(test.answers.length).to.be.equal(6);
        }
    });
    it('getG2Stest_SimpleFunctions. 4 simple question, 6 simple answers', () => {
        let test: any;
        for (let i = 0; i < 100; i++) {
            test = tests.getG2Stest_SimpleFunctions(0);

            chai.expect(test.question.length).to.be.equal(4);
            for (let j = 0; j < 4; j++) {
                chai.expect(test.question[j].graph.length).to.be.equal(1);
                chai.expect(test.question[j].correctIDs.length).to.be.not.equal(0);
            }

            chai.expect(test.answers.length).to.be.equal(6);
            for (let j = 0; j < 6; j++) {
                chai.expect(test.answers[j].text).to.not.be.null;
                chai.expect(test.answers[j].id).to.not.be.null;
            }
        }
    });
    it('getG2Stest_ComplexFunctions. 4 complex question, 4 complex answers.', () => {
        let test: any;
        for (let i = 0; i < 100; ++i) {
            test = tests.getG2Stest_ComplexFunctions(0);

            chai.expect(test.question.length).to.be.equal(4);
            for (let j = 0; j < 4; ++j) {
                chai.expect(test.question[j].graph.length).to.be.equal(2);
                chai.expect(test.question[j].correctIDs.length).to.be.not.equal(0);
            }


            chai.expect(test.answers.length).to.be.equal(6);
            for (let j = 0; j < 4; ++j) {
                chai.expect(test.answers[j].text).to.not.be.null;
                chai.expect(test.answers[j].id).to.not.be.null;
            }
        }
    });
    it('getSGtest_SimpleAnswers. 1 complex question,  3 simple answers.', () => {
        let test: any;
        for (let i = 0; i < 100; i++) {
            test = tests.getSGtest_SimpleAnswers(0);

            chai.expect(test.question[0].graph.length).to.be.at.most(5);
            chai.expect(test.question[0].graph.length).to.be.at.least(3);

            chai.expect(test.answers.length).to.be.equal(3);
            for (let j = 0; j < 3; j++) {
                chai.expect(test.answers[j].id).to.not.be.null;
                chai.expect(test.answers[j].letter).to.not.be.equal('');
                chai.expect(test.answers[j].leftIndex).to.not.be.null;
                chai.expect(test.answers[j].rightIndex).to.not.be.null;
                chai.expect(test.answers[j].correctSign).to.oneOf([-1, 0, 1]);
            }
        }
    });
    it('getSGtest_ComplexAnswers. 1 complex question,  6 complex answers.', () => {
        let test: any;
        for (let i = 0; i < 100; i++) {
            test = tests.getSGtest_ComplexAnswers(0);

            chai.expect(test.question[0].graph.length).to.be.at.most(5);
            chai.expect(test.question[0].graph.length).to.be.at.least(3);

            chai.expect(test.answers.length).to.be.equal(6);
            for (let j = 0; j < 6; j++) {
                chai.expect(test.answers[j].id).to.not.be.null;
                chai.expect(test.answers[j].letter).to.not.be.equal('');
                chai.expect(test.answers[j].leftIndex).to.not.be.null;
                chai.expect(test.answers[j].rightIndex).to.not.be.null;
                chai.expect(test.answers[j].correctSign).to.oneOf([-1, 0, 1]);
            }
        }
    });
    it('getG2Stest. 4 unique correct IDs', () => {
        let test_1: any, test_2: any,
            test_1_unique: any, test_2_unique: any;
        for (let i = 0; i < 100; ++i) {
            test_1 = tests.getG2Stest_SimpleFunctions(i);
            test_2 = tests.getG2Stest_ComplexFunctions(i);
            test_1_unique = Array<number>();
            test_2_unique = Array<number>();
            for (let j = 0; j < Config.G2S_questionCount; ++j) {
                for (let id of test_1.question[j].correctIDs)
                    if (!test_1_unique.contains(id))
                        test_1_unique.push(id);
                for (let id of test_2.question[j].correctIDs)
                    if (!test_2_unique.contains(id))
                        test_2_unique.push(id);
            }
            chai.expect(test_1_unique.length).to.be.equal(4);
            chai.expect(test_2_unique.length).to.be.equal(4);
        }
    })
});

describe('Tests correctness, FUNCTION LENGTH', () => {
    it('getG2Gtest question and answers functions should have correct length', () => {
        let test: any;
        for (let i = 0; i < 100; ++i) {
            test = tests.getG2Gtest_OneAnswerGraph(i);
            chai.expect(test.question.graph[0].params.len).to.be.equal(Config.defaultLength);
            for (let j = 0; j < Config.answerCount; ++j)
                chai.expect(test.answers[j].graph[0].params.len).to.be.equal(Config.defaultLength);
        }
    });
    it('getG2Stest question functions should have correct length', () => {
        let test_1: any, test_2: any;
        for (let i = 0; i < 100; ++i) {
            test_1 = tests.getG2Stest_SimpleFunctions(i);
            test_2 = tests.getG2Stest_ComplexFunctions(i);
            for (let j = 0; j < Config.answerCount - 2; ++j) {
                chai.expect(test_1.question[j].graph[0].params.len).to.be.equal(Config.defaultLength);
                chai.expect(test_2.question[j].graph[0].params.len).to.be.equal(Config.defaultLength / 2);
                chai.expect(test_2.question[j].graph[1].params.len).to.be.equal(Config.defaultLength / 2);
            }
        }
    });
    it('getSGtest question and answers functions should have correct length', () => {
        let test_1: any, test_2: any, cumLength_1 = 0, cumLength_2 = 0;
        for (let i = 0; i < 100; ++i) {
            test_1 = tests.getSGtest_SimpleAnswers(i);
            test_2 = tests.getSGtest_ComplexAnswers(i);
            for (let j = 0; j < test_1.question[0].graph.length; ++j) {
                cumLength_1 += test_1.question[0].graph[j].params.len;

            }
            for (let j = 0; j < test_2.question[0].graph.length; ++j) {
                cumLength_2 += test_2.question[0].graph[j].params.len;
            }
            chai.expect(cumLength_2).to.be.equal(Config.defaultLength);
            chai.expect(cumLength_1).to.be.equal(Config.defaultLength);
            cumLength_1 = 0;
            cumLength_2 = 0;
        }
    });
    it("getSGtest_SimpleAnswers. Check for copy bug", () => {
        let test: any;
        for (let i = 0; i < 10; i++) {
            test = tests.getSGtest_SimpleAnswers.bind(null, 0)();
            chai.expect(test.question[0].graph[0].params).haveOwnProperty("len");
            chai.expect(test.question[0].graph[0].params.len).to.be.greaterThan(0).and.lessThan(Config.defaultLength);
        }
    });
});
