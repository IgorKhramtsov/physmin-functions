import chai = require('chai');
import {FunctionObj} from "../src/FunctionObj";
import {Config} from "../src/Config";
import {UnitFirst as tests} from "../src/UnitFirst"
import {FunctionBuilder} from "../src/FunctionBuilder";

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
    // ----------------------------------------------------------------------------------
    it('createQuestionFunctions should not throw any exceptions', () => {
        let funcBuilder: any;
        for (let i = 0; i < 100; ++i) {
            funcBuilder = new FunctionBuilder();
            chai.expect(() => funcBuilder.getQuestionFunction()).to.not.throw(Error);
        }
    });
    // ----------------------------------------------------------------------------------
    it("Correct function should have right types", () => {
        let correct_array: any,
            funcBuilder: any;
        for (let i = 0; i < 100; i++) {
            funcBuilder = new FunctionBuilder();
            funcBuilder.setLength(0);
            funcBuilder.setAvailableAxises(['x']);
            funcBuilder.getQuestionFunction();
            correct_array = Array<FunctionObj>();

            funcBuilder.setLength(0);
            funcBuilder.setAvailableAxises(['v']);
            correct_array.push(funcBuilder.getCorrectFunction());
            funcBuilder.setLength(0);
            funcBuilder.setAvailableAxises(['a']);
            correct_array.push(funcBuilder.getCorrectFunction());

            chai.expect(correct_array[0].funcType).to.be.equal("v");
            chai.expect(correct_array[1].funcType).to.be.equal("a");
        }
    });
    // ----------------------------------------------------------------------------------
    it("Correct functions should be Correct", () => {
        let funcBuilder: any,
            question: any,
            correct_array: any;
        for (let i = 0; i < 100; i++) {
            funcBuilder = new FunctionBuilder();
            funcBuilder.setAvailableAxises(['x']);
            question = funcBuilder.getQuestionFunction();

            correct_array = Array<FunctionObj>();

            funcBuilder.setAvailableAxises(['x', 'v']);
            correct_array.push(funcBuilder.getCorrectFunction());
            funcBuilder.setAvailableAxises(['x', 'v', 'a']);
            correct_array.push(funcBuilder.getCorrectFunction());


            let correctFunctionToCompare = new FunctionObj(question.funcType, correct_array[0].copyParams());
            correctFunctionToCompare.params.x = question.params.x;
            chai.expect(correctFunctionToCompare.equalBySignTo(question)).to.be.true;

            correctFunctionToCompare = new FunctionObj(question.funcType, correct_array[1].copyParams());
            correctFunctionToCompare.params.x = question.params.x;
            correctFunctionToCompare.params.v = question.params.v;
            chai.expect(correctFunctionToCompare.equalBySignTo(question)).to.be.true;
        }
    });
    // ----------------------------------------------------------------------------------
    it("Incorrect functions should not be Correct", () => {
        let question: any,
            funcBuilder = new FunctionBuilder(),
            incorrectFunc;
        for (let i = 0; i < 100; ++i) {
            funcBuilder.reset();
            question = funcBuilder.getQuestionFunction();

            for (let k = 0; k < 2; k++) {
                incorrectFunc = funcBuilder.getIncorrectFunction();
                chai.expect(incorrectFunc.equalByValueTo(question)).to.be.false;
            }
        }
    });
    // ----------------------------------------------------------------------------------
    it("Generated functions should not going out of bounds", () => {
        let question: any,
            funcBuilder = new FunctionBuilder(),
            func: FunctionObj;
        for (let i = 0; i < 100; i++) {
            funcBuilder.reset();
            funcBuilder.setAvailableAxises(['x']);
            question = funcBuilder.getQuestionFunction();

            func = funcBuilder.getCorrectFunction();
            for (const param of Object.keys(func.params).deleteItem("len"))
                chai.expect(Math.abs(func.params[param])).to.be.lessThan(Config.upperLimit)

            func = funcBuilder.getIncorrectFunction();
            for (const param of Object.keys(func.params).deleteItem("len"))
                chai.expect(Math.abs(func.params[param])).to.be.lessThan(Config.upperLimit)
        }
    });
    // ----------------------------------------------------------------------------------
    it('Generate params should not return all zeros', () => {
        let func: any;
        for (let i = 0; i < 100; i++) {
            func = new FunctionObj().generateParams();
            chai.expect(func.params).to.be.not.equal({x: 0, v: 0, a: 0});
        }
    })
});

describe('Minor functions', () => {
    // ----------------------------------------------------------------------------------
    it('createNextFunction should not throw any exceptions.', () => {
        let funcBuilder: any;
        for (let i = 0; i < 100; ++i) {
            funcBuilder = new FunctionBuilder();
            chai.expect(() => funcBuilder.getComplexFunction([Config.defaultLength / 2, Config.defaultLength / 2])).to.not.throw(Error);
        }
    });
    // ----------------------------------------------------------------------------------
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
    // ----------------------------------------------------------------------------------
    it('snapToGrid should not throw any exceptions.', () => {
        let funcBuilder: any;
        for (let i = 0; i < 100; i++) {
            funcBuilder = new FunctionBuilder();
            funcBuilder.setLength(Config.defaultLength / 2);
            chai.expect(() => funcBuilder.getCorrectFunction).to.not.throw(Error);
        }
    });
    // ----------------------------------------------------------------------------------
    it('createNextCoupleIndexes should not throw any exceptions.', () => {
        let indexes = Array<Array<Array<number>>>(),
            questionCount = 5;
        for (let i = 0; i < 100; i++)
            chai.expect(() => FunctionObj.createNextCoupleIndexes(questionCount, indexes)).to.not.throw(Error);
    });
    // ----------------------------------------------------------------------------------
    it('createNextIndex should not throw any exceptions.', () => {
        let leftCoupleIndexes: any,
            questionCount = 6;

        for (let i = 0; i < 100; i++) {
            chai.expect(() => leftCoupleIndexes = FunctionObj.createNextIndex(questionCount)).to.not.throw(Error);
            chai.expect(() => FunctionObj.createNextIndex(questionCount, [leftCoupleIndexes])).to.not.throw(Error)
        }
    })
    // ----------------------------------------------------------------------------------
});

describe('Tests correctness, COMPOSITION', () => {
    // ----------------------------------------------------------------------------------
    it('getG2Gtest_OneAnswerGraph. 1 question, 1 correct answer, 3 incorrect answers', () => {
        let test: any;
        for (let i = 0; i < 10; i++) {
            test = tests.getG2Gtest_OneAnswerGraph(0);
            chai.expect(test.question.graph.length).to.be.equal(1);
            chai.expect(test.question.correctIDs.length).to.be.equal(1);
            chai.expect(test.answers.length).to.be.equal(6);

        }
    });
    // ----------------------------------------------------------------------------------
    it('getG2Gtest_TwoAnswerGraph. 1 question, 2 correct answer, 2 incorrect answers', () => {
        let test: any;
        for (let i = 0; i < 100; i++) {
            test = tests.getG2Gtest_TwoAnswerGraph(0);
            chai.expect(test.question.graph.length).to.be.equal(1);
            chai.expect(test.question.correctIDs.length).to.be.equal(2);
            chai.expect(test.answers.length).to.be.equal(6);
        }
    });
    // ----------------------------------------------------------------------------------
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
            for (let j = 0; j < 4; j++) {
                chai.expect(test.answers[j].text).to.not.be.null;
                chai.expect(test.answers[j].id).to.not.be.null;
            }
        }
    });
    // ----------------------------------------------------------------------------------
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
    // ----------------------------------------------------------------------------------
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
    // ----------------------------------------------------------------------------------
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
    // ----------------------------------------------------------------------------------
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
    // ----------------------------------------------------------------------------------
});

describe('Tests correctness, FUNCTION LENGTH', () => {
    // ----------------------------------------------------------------------------------
    it('getG2Gtest question and answers functions should have correct length', () => {
        let test: any;
        for (let i = 0; i < 100; ++i) {
            test = tests.getG2Gtest_OneAnswerGraph(i);
            chai.expect(test.question.graph[0].params.len).to.be.equal(Config.defaultLength);
            for (let j = 0; j < Config.answerCount; ++j)
                chai.expect(test.answers[j].graph[0].params.len).to.be.equal(Config.defaultLength);
        }
    });
    // ----------------------------------------------------------------------------------
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
    // ----------------------------------------------------------------------------------
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
    // ----------------------------------------------------------------------------------
    it("getSGtest_SimpleAnswers. Check for copy bug", () => {
        let test: any;
        for (let i = 0; i < 10; i++) {
            test = tests.getSGtest_SimpleAnswers.bind(null, 0)();
            chai.expect(test.question[0].graph[0].params).haveOwnProperty("len");
            chai.expect(test.question[0].graph[0].params.len).to.be.greaterThan(0).and.lessThan(Config.defaultLength);
        }
    });
    // ----------------------------------------------------------------------------------
});
