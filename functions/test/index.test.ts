import chai = require('chai');
import {FunctionObj} from "../src/FunctionObj";
import {Config} from "../src/Config";
import {UnitFirst as tests} from "../src/UnitFirst"
import {FunctionBuilder} from "../src/FunctionBuilder";

function checkCorrectFunc(questionFunc: FunctionObj, correctFunc: FunctionObj) {
    let forCompare: FunctionObj,
        correctFuncType = correctFunc.funcType;
    switch (questionFunc.funcType) {
        case 'x':
            if (correctFuncType === 'v') {
                forCompare = new FunctionObj(questionFunc.funcType, correctFunc.copyParams());
                forCompare.params.x = questionFunc.params.x;
                return forCompare.equalByValueTo(questionFunc);
            } else if (correctFuncType === 'a') {
                forCompare = new FunctionObj(questionFunc.funcType, correctFunc.copyParams());
                forCompare.params.x = questionFunc.params.x;
                forCompare.params.v = questionFunc.params.v;
                return forCompare.equalByValueTo(questionFunc);
            }
            break;
        case 'v':
            if (correctFuncType === 'x') {
                forCompare = new FunctionObj(questionFunc.funcType, correctFunc.copyParams()).clearParams();
                return forCompare.equalByValueTo(questionFunc);
            } else if (correctFuncType === 'a') {
                forCompare = new FunctionObj(questionFunc.funcType, correctFunc.copyParams());
                forCompare.params.v = questionFunc.params.v;
                return forCompare.equalByValueTo(questionFunc);
            }
            break;

        case 'a':
            if (correctFuncType === 'x' || correctFuncType === 'v') {
                forCompare = new FunctionObj(questionFunc.funcType, correctFunc.copyParams()).clearParams();
                return forCompare.equalByValueTo(questionFunc);
            }
            break;
    }
    return false;
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
            chai.expect(correctFunctionToCompare.equalBySignTo(question)).to.be.true;

            correctFunctionToCompare = new FunctionObj(question.funcType, correct_array[1].copyParams());
            correctFunctionToCompare.params.x = question.params.x;
            correctFunctionToCompare.params.v = question.params.v;
            chai.expect(correctFunctionToCompare.equalBySignTo(question)).to.be.true;
        }
    });

    it("FunctionBuilder. Generated functions should not going out of bounds", () => {
        let builder = new FunctionBuilder(),
            func: FunctionObj;
        for (let i = 0; i < 100; ++i) {
            for (let axis of ['x', 'v', 'a']) {
                builder.reset();
                builder.setAllowedAxes([axis]);

                func = builder.getQuestionFunction();
                for (const param of Object.keys(func.params).deleteItem("len"))
                    chai.expect(Math.abs(func.params[param])).to.be.lessThan(Config.upperLimit)

                func = builder.getCorrectFunction();
                for (const param of Object.keys(func.params).deleteItem("len"))
                    chai.expect(Math.abs(func.params[param])).to.be.lessThan(Config.upperLimit)

                func = builder.getIncorrectFunction();
                for (const param of Object.keys(func.params).deleteItem("len"))
                    chai.expect(Math.abs(func.params[param])).to.be.lessThan(Config.upperLimit)
            }
        }
    });

    it('Complex Function. Functions should connect', () => {
        let builder: FunctionBuilder = new FunctionBuilder(),
            complexFunction: Array<FunctionObj>,
            funcLength = Config.defaultLength / 2,
            prevEnd: number,
            nextStart: number;
        for (let i = 0; i < 100; ++i) {
            builder.reset();

            complexFunction = builder.getComplexFunction([funcLength, funcLength]);
            prevEnd = complexFunction[0].calcFunctionValue();
            nextStart = complexFunction[1].params[complexFunction[1].funcType];
            chai.expect(prevEnd).to.be.equal(nextStart);
        }
    });
    it('Complex Function. Last function must not cross limit lines', () => {
        let builder: FunctionBuilder = new FunctionBuilder(),
            lastFunc: FunctionObj,
            funcLength: number = Config.defaultLength / 2;
        for (let i = 0; i < 100; ++i) {
            builder.reset();
            lastFunc = builder.getComplexFunction([funcLength, funcLength]).last();
            chai.expect(Math.abs(lastFunc.calcFunctionValue(funcLength))).to.be.at.most(Config.upperLimit);
        }
    });
});

describe('Function Builder. Function correctness', () => {
    it('getG2Gtest.', () => {
        let builder = new FunctionBuilder(),
            questionFunc: FunctionObj,
            correctFuncArray: Array<FunctionObj>,
            incorrectFuncArray: Array<FunctionObj>,
            incorrectFunc: FunctionObj,
            correctAnswersCountArray = [1, 2],
            incorrectAnswersCount = Config.graph2graph_answersCount;
        for (let i = 0; i < 100; ++i) {
            for (let correctAnswersCount of correctAnswersCountArray) {
                builder.reset();
                correctFuncArray = Array<FunctionObj>();
                incorrectFuncArray = Array<FunctionObj>();

                builder.disableLimit();
                builder.disableAllowedAxesUsage();
                questionFunc = builder.getQuestionFunction();
                for (let j = 0; j < correctAnswersCount; ++j) {
                    correctFuncArray.push(builder.getCorrectFunction());
                    chai.expect(checkCorrectFunc(questionFunc, correctFuncArray.last())).to.be.true;
                }
                for (let j = 0; j < incorrectAnswersCount - correctAnswersCount; ++j) {
                    incorrectFunc = builder.getIncorrectFunction();

                    chai.expect(questionFunc.equalByValueTo(incorrectFunc)).to.be.false;
                    for (let func of incorrectFuncArray)
                        chai.expect(incorrectFunc.equalBySignTo(func)).to.be.false;
                    for (let func of correctFuncArray)
                        chai.expect(incorrectFunc.equalByTextTo(func)).to.be.false;


                    incorrectFuncArray.push(incorrectFunc);
                }
            }
        }
    });

    it.only('getG2Stest.', () => {
        let builder = new FunctionBuilder(),
            questionFuncArray: Array<FunctionObj>,
            correctFuncArray: Array<FunctionObj>,
            questionCount = Config.graph2state_questionCount,
            correctAnswersCount: number,
            suspectCorrectAnwers: Array<FunctionObj>;
        for (let i = 0; i < 100; ++i) {
            builder.reset();
            builder.disableLimit();
            builder.disableAllowedAxesUsage();
            builder.disableDuplicateText();
            questionFuncArray = Array<FunctionObj>();
            correctFuncArray = Array<FunctionObj>();


            for (let j = 0; j < questionCount; ++j) {
                questionFuncArray.push(builder.getQuestionFunction());
                correctFuncArray.push(builder.getCorrectFunction())
            }


            for (let questionFunc of questionFuncArray) {
                correctAnswersCount = 0;
                console.log(JSON.stringify(questionFunc));
                suspectCorrectAnwers = [];

                for (let correctFunc of correctFuncArray)
                    if (checkCorrectFunc(questionFunc, correctFunc)) {
                        console.log(JSON.stringify(correctFunc), correctFunc.getTextDescription(false));
                        suspectCorrectAnwers.push(correctFunc);
                        correctAnswersCount++;
                    }

                let suspect: FunctionObj;
                let suspectCount=0;
                for (let i = 0; i < suspectCorrectAnwers.length; ++i) {
                    suspect = suspectCorrectAnwers[i];
                    for (let j = 0; j < suspectCorrectAnwers.length; ++j) {
                        if(i != j){
                            if(suspect.equalByTextTo(suspectCorrectAnwers[j])){
                                suspectCount++;
                            }
                        }
                    }
                }

                suspectCount /=2;
                console.log(suspectCount);
                console.log('----------');
                //chai.expect(correctAnswersCount).to.be.equal(1);
                chai.expect(suspectCount).to.be.equal(0);
            }
        }
    });
    it('getSGtest', () => {

    })
});

describe('Minor functions', () => {
    it('createNextFunction. Should not throw any exceptions.', () => {
        let builder: any,
            funcLength = Config.defaultLength / 2;
        for (let i = 0; i < 100; ++i) {
            builder = new FunctionBuilder();
            chai.expect(() => builder.getComplexFunction([funcLength, funcLength])).to.not.throw(Error);
        }
    });
    it('getTextDescription. Should not throw any exceptions.', () => {
        let func: any,
            builder: any;
        for (let i = 0; i < 100; ++i) {
            builder = new FunctionBuilder();
            builder.getQuestionFunction();
            func = builder.getCorrectFunction();
            chai.expect(() => func.getTextDescription(false)).to.not.throw(Error);
        }
    });
    it('snapEnd. Should not throw any exceptions.', () => {
        let builder: any;
        for (let i = 0; i < 100; i++) {
            builder = new FunctionBuilder();
            builder.setLength(Config.defaultLength / 2);
            chai.expect(() => builder.getCorrectFunction).to.not.throw(Error);
        }
    });
    it('createNextCoupleIndexes. Should not throw any exceptions.', () => {
        let indexes = Array<Array<Array<number>>>(),
            questionCount = 5;
        for (let i = 0; i < 100; i++)
            chai.expect(() => FunctionObj.createNextCoupleIndexes(questionCount, indexes)).to.not.throw(Error);
    });
    it('createNextIndex. Should not throw any exceptions.', () => {
        let leftCoupleIndexes: any,
            questionCount = 6;

        for (let i = 0; i < 100; i++) {
            chai.expect(() => leftCoupleIndexes = FunctionObj.createNextIndex(questionCount)).to.not.throw(Error);
            chai.expect(() => FunctionObj.createNextIndex(questionCount, [leftCoupleIndexes])).to.not.throw(Error)
        }
    });
    it('generateParams. Generated params should not be all zeros', () => {
        let func: any,
            isAllZeros: boolean;
        for (let i = 0; i < 100; ++i) {
            func = new FunctionObj().generateParams();
            isAllZeros = func.params.x === 0 && func.params.v === 0 && func.params.a === 0;
            chai.expect(isAllZeros).to.be.false;
        }
    })
});

describe('Tests correctness, COMPOSITION', () => {
    it('getG2Gtest_OneAnswerGraph. 1 question, 1 correct answer, 3 incorrect answers', () => {
        let test: any,
            questionCount = Config.graph2graph_questionCount,
            answersCount = Config.graph2graph_answersCount,
            correctIDsCount = 1;
        for (let i = 0; i < 100; ++i) {
            test = tests.getG2Gtest_OneAnswerGraph(0);
            chai.expect(test.question.graph.length).to.be.equal(questionCount);
            chai.expect(test.question.correctIDs.length).to.be.equal(correctIDsCount);
            chai.expect(test.answers.length).to.be.equal(answersCount);
        }
    });
    it('getG2Gtest_TwoAnswerGraph. 1 question, 2 correct answer, 2 incorrect answers', () => {
        let test: any,
            questionCount = Config.graph2graph_questionCount,
            answersCount = Config.graph2graph_answersCount,
            correctIDsCount = 2;
        for (let i = 0; i < 100; ++i) {
            test = tests.getG2Gtest_TwoAnswerGraph(0);
            chai.expect(test.question.graph.length).to.be.equal(questionCount);
            chai.expect(test.question.correctIDs.length).to.be.equal(correctIDsCount);
            chai.expect(test.answers.length).to.be.equal(answersCount);
        }
    });
    it('getG2Stest_SimpleFunctions. 4 simple question, 6 simple answers', () => {
        let test: any,
            questionCount = Config.graph2state_questionCount,
            answersCount = Config.graph2state_answersCount;
        for (let i = 0; i < 100; i++) {
            test = tests.getG2Stest_SimpleFunctions(0);

            chai.expect(test.question.length).to.be.equal(questionCount);
            for (let j = 0; j < questionCount; ++j) {
                chai.expect(test.question[j].graph.length).to.be.equal(1);
                chai.expect(test.question[j].correctIDs.length).to.be.not.equal(0);
            }

            chai.expect(test.answers.length).to.be.equal(answersCount);
            for (let j = 0; j < answersCount; ++j) {
                chai.expect(test.answers[j].text).to.not.be.null;
                chai.expect(test.answers[j].id).to.not.be.null;
            }
        }
    });
    it('getG2Stest_ComplexFunctions. 4 complex question, 4 complex answers.', () => {
        let test: any,
            questionCount = Config.graph2state_questionCount,
            answersCount = Config.graph2state_answersCount;
        for (let i = 0; i < 100; ++i) {
            test = tests.getG2Stest_ComplexFunctions(0);

            chai.expect(test.question.length).to.be.equal(questionCount);
            for (let j = 0; j < questionCount; ++j) {
                chai.expect(test.question[j].graph.length).to.be.equal(2);
                chai.expect(test.question[j].correctIDs.length).to.be.not.equal(0);
            }

            chai.expect(test.answers.length).to.be.equal(answersCount);
            for (let j = 0; j < answersCount; ++j) {
                chai.expect(test.answers[j].text).to.not.be.null;
                chai.expect(test.answers[j].id).to.not.be.null;
            }
        }
    });
    it('getSGtest_SimpleAnswers. 1 complex question,  3 simple answers.', () => {
        let test: any,
            lowerBound = Config.bounds.sign2graph_questionCount[0],
            upperBound = Config.bounds.sign2graph_questionCount[1],
            answersCount = Config.sign2graph_simple_answersCount;
        for (let i = 0; i < 100; ++i) {
            test = tests.getSGtest_SimpleAnswers(0);

            chai.expect(test.question[0].graph.length).to.be.at.most(upperBound);
            chai.expect(test.question[0].graph.length).to.be.at.least(lowerBound);

            chai.expect(test.answers.length).to.be.equal(answersCount);
            for (let j = 0; j < answersCount; ++j) {
                chai.expect(test.answers[j].id).to.not.be.null;
                chai.expect(test.answers[j].letter).to.not.be.equal('');
                chai.expect(test.answers[j].leftIndex).to.not.be.null;
                chai.expect(test.answers[j].rightIndex).to.not.be.null;
                chai.expect(test.answers[j].correctSign).to.oneOf([-1, 0, 1]);
            }
        }
    });
    it('getSGtest_ComplexAnswers. 1 complex question,  6 complex answers.', () => {
        let test: any,
            lowerBound = Config.bounds.sign2graph_questionCount[0],
            upperBound = Config.bounds.sign2graph_questionCount[1],
            answersCount = Config.sign2graph_complex_answersCount;
        for (let i = 0; i < 100; ++i) {
            test = tests.getSGtest_ComplexAnswers(0);

            chai.expect(test.question[0].graph.length).to.be.at.most(upperBound);
            chai.expect(test.question[0].graph.length).to.be.at.least(lowerBound);

            chai.expect(test.answers.length).to.be.equal(answersCount);
            for (let j = 0; j < answersCount; ++j) {
                chai.expect(test.answers[j].id).to.not.be.null;
                chai.expect(test.answers[j].letter).to.not.be.equal('');
                chai.expect(test.answers[j].leftIndex).to.not.be.null;
                chai.expect(test.answers[j].rightIndex).to.not.be.null;
                chai.expect(test.answers[j].correctSign).to.oneOf([-1, 0, 1]);
            }
        }
    });
    it('getG2Stest. 4 unique correct IDs', () => {
        let simpleTest: any,
            complexTest: any,
            simpleTestCorrectIDs: any,
            complexTestCorrectIDs: any;
        for (let i = 0; i < 100; ++i) {
            simpleTest = tests.getG2Stest_SimpleFunctions(i);
            complexTest = tests.getG2Stest_ComplexFunctions(i);
            simpleTestCorrectIDs = Array<number>();
            complexTestCorrectIDs = Array<number>();

            for (let j = 0; j < Config.graph2state_questionCount; ++j) {

                for (let id of simpleTest.question[j].correctIDs)
                    if (!simpleTestCorrectIDs.contains(id))
                        simpleTestCorrectIDs.push(id);

                for (let id of complexTest.question[j].correctIDs)
                    if (!complexTestCorrectIDs.contains(id))
                        complexTestCorrectIDs.push(id);
            }
            chai.expect(simpleTestCorrectIDs.length).to.be.equal(4);
            chai.expect(complexTestCorrectIDs.length).to.be.equal(4);
        }
    })
});

describe('Tests correctness, FUNCTION LENGTH', () => {
    it('getG2Gtest question and answers functions should have correct length', () => {
        let test: any;
        for (let i = 0; i < 100; ++i) {
            test = tests.getG2Gtest_OneAnswerGraph(i);
            chai.expect(test.question.graph[0].params.len).to.be.equal(Config.defaultLength);
            for (let j = 0; j < Config.graph2graph_answersCount; ++j)
                chai.expect(test.answers[j].graph[0].params.len).to.be.equal(Config.defaultLength);
        }
    });
    it('getG2Stest_SimpleFunctions. Question functions should have correct length', () => {
        let test: any;
        for (let i = 0; i < 100; ++i) {
            test = tests.getG2Stest_SimpleFunctions(i);
            for (let j = 0; j < Config.graph2state_answersCount; ++j)
                chai.expect(test.question[j].graph[0].params.len).to.be.equal(Config.defaultLength);
        }
    });
    it('getG2Stest_ComplexFunctions. Question functions should have correct length', () => {
        let test: any;
        for (let i = 0; i < 100; ++i) {
            test = tests.getG2Stest_ComplexFunctions(i);

            for (let j = 0; j < Config.graph2state_answersCount; ++j) {
                chai.expect(test.question[j].graph[0].params.len).to.be.equal(Config.defaultLength / 2);
                chai.expect(test.question[j].graph[1].params.len).to.be.equal(Config.defaultLength / 2);
            }
        }
    });
    it('getSGtest_SimpleAnswers. Question and Answers functions should have correct length', () => {
        let test: any,
            cumLength: number;
        for (let i = 0; i < 100; ++i) {
            cumLength = 0;
            test = tests.getSGtest_SimpleAnswers(i);

            for (let j = 0; j < test.question[0].graph.length; ++j)
                cumLength += test.question[0].graph[j].params.len;
            chai.expect(cumLength).to.be.equal(Config.defaultLength);
        }
    });
    it('getSGtest_ComplexAnswers. Question and Answers functions should have correct length', () => {
        let test: any,
            cumLength: number;
        for (let i = 0; i < 100; ++i) {
            cumLength = 0;
            test = tests.getSGtest_ComplexAnswers(i);

            for (let j = 0; j < test.question[0].graph.length; ++j)
                cumLength += test.question[0].graph[j].params.len;
            chai.expect(cumLength).to.be.equal(Config.defaultLength);
        }
    });
});
