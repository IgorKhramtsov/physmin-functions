import FunctionObj from "../src/FunctionObj";
import { Config } from "../src/Config";
const chai = require('chai');
// const test = require('firebase-functions-test')();
import * as tests from "../src/index"

describe("Test generators", () => {
  it("Graph to Graph(1 answer) should not throws any exceptions", () => {
    for (let i = 0; i < 200; i++)
      chai.expect(tests.getG2Gtest_OneAnswerGraph.bind(null, 2)).to.not.throw(Error);
  });
  it("Graph to Graph(2 answers) should not throws any exceptions", () => {
    for (let i = 0; i < 200; i++)
      chai.expect(tests.getG2Gtest_TwoAnswerGraph.bind(null, 0)).to.not.throw(Error);
  });
  it("Graph to State(simple graphs) should not throws any exceptions", () => {
    for (let i = 0; i < 200; i++)
      chai.expect(tests.getG2Stest_SimpleFunctions.bind(null, 4)).to.not.throw(Error);
  });
  it("Graph to State(complex graphs) should not throws any exceptions", () => {
    for (let i = 0; i < 200; i++)
      chai.expect(tests.getG2Stest_ComplexFunctions.bind(null, 4)).to.not.throw(Error);
  });
  it("Graph to State(mixed 0-99%) should not throws any exceptions", () => {
    for (let i = 0; i < 100; i++)
      chai.expect(tests.getG2Stest_MixedFunctions.bind(null, 4, i / 10.0)).to.not.throw(Error);
  });
});

describe("Function generators", () => {
  it("Correct function should have right types", () => {
    let _funcLength = Config.defaultLength,
      question: any,
      correct_array: any;
    for (let i = 0; i < 100; i++) {
      question = new FunctionObj().makeQuestionFunction(["x"], _funcLength, []);
      correct_array = Array<FunctionObj>();
      correct_array.push(question.getCorrectFunction(["x", "v"], _funcLength, correct_array));
      correct_array.push(question.getCorrectFunction(["x", "v", "a"], _funcLength, correct_array));

      chai.expect(correct_array[0].funcType).to.equal("v");
      chai.expect(correct_array[1].funcType).to.equal("a");
    }
  });
  it("Correct functions should be Correct", () => {
    let _funcLength = Config.defaultLength,
      question: any,
      correct_array: any;
    for (let i = 0; i < 100; i++) {
      question = new FunctionObj().makeQuestionFunction(["x"], _funcLength, []);
      correct_array = Array<FunctionObj>();
      correct_array.push(question.getCorrectFunction(["x", "v"], _funcLength, correct_array));
      correct_array.push(question.getCorrectFunction(["x", "v", "a"], _funcLength, correct_array));

      let correctFunctionToCompare = new FunctionObj(question.funcType, correct_array[0].copyParams());
      correctFunctionToCompare.params.x = question.params.x;
      chai.expect(correctFunctionToCompare.equalTo(question)).to.be.true;

      correctFunctionToCompare = new FunctionObj(question.funcType, correct_array[1].copyParams());
      correctFunctionToCompare.params.x = question.params.x;
      correctFunctionToCompare.params.v = question.params.v;
      chai.expect(correctFunctionToCompare.equalTo(question)).to.be.true;
    }
  });
  it("Incorrect functions should not be Correct", () => {
    let _funcLength = Config.defaultLength,
      question: any,
      incorrect_array: any;
    for (let i = 0; i < 100; i++) {
      question = new FunctionObj().makeQuestionFunction(["x"], _funcLength, []);
      incorrect_array = Array<FunctionObj>();
      for (let k = 0; k < 6; k++) {
        incorrect_array.push(question.getIncorrectFunction(["x", "v", "a"], _funcLength, incorrect_array));
        let incorrectFunctionToCompare = new FunctionObj(question.funcType, incorrect_array[k].copyParams());
        incorrectFunctionToCompare.params.x = question.params.x;
        if (incorrect_array[k].funcType == "a") incorrectFunctionToCompare.params.v = question.params.v;

        chai.expect(incorrectFunctionToCompare.equalTo(question)).to.be.false;
      }
    }
  });
  it("Check for SG test copy bug", () => {
    for (let i = 0; i < 10; i++) {
      let test = tests.getSGtest(i, true);
      chai.expect(test.question[0].graph[0].params).haveOwnProperty("len");
      chai.expect(test.question[0].graph[0].params.len).to.be.greaterThan(0);
    }
  });
});

describe('Minor functions', () => {
  // ----------------------------------------------------------------------------------
  it('createNextFunction should not throw any exceptions.', () => {
    let _funcLength = Config.defaultLength,
      question: any;
    for (let i = 0; i < 100; i++) {
      question = new FunctionObj().
        makeQuestionFunction(Config.axisIndexes, _funcLength / 2).
        getCorrectFunction(Config.axisIndexes, _funcLength / 2);
      chai.expect(question.createNextFunction.bind(null, [], _funcLength / 2)).to.not.throw(Error);
    }
  })
  it('createNextFunction should return function that have opposite direction than function that did call.', () => {
    let _funcLength = Config.defaultLength,
      question: any,
      nextFunc: any;
    for (let i = 0; i < 100; i++) {
      question = new FunctionObj().
        makeQuestionFunction(Config.axisIndexes, _funcLength / 2).
        getCorrectFunction(Config.axisIndexes, _funcLength / 2);
      nextFunc = question.createNextFunction([], _funcLength / 2)
      chai.expect(nextFunc.equalTo(question)).to.be.false;
      chai.expect(nextFunc.equalToByDirection(question)).to.be.false;
    }
  })
  // ----------------------------------------------------------------------------------
  it('snapToGrid should not throw any exceptions.', () => {
    let _funcLength = Config.defaultLength;
    for (let i = 0; i < 100; i++)
      chai.expect(new FunctionObj().makeQuestionFunction(Config.axisIndexes, _funcLength / 2)).to.not.throw(Error);
  })
  // ----------------------------------------------------------------------------------
  it('createNextCoupleIndexes should not throw any exceptions.', () => {
    let indexes = Array<Array<Array<number>>>(),
      questionCount = 5;
    for (let i = 0; i < 100; i++)
      chai.expect(FunctionObj.createNextCoupleIndexes(questionCount, indexes)).to.not.throw(Error);
  })
  it('createNextIndex should not have cicle count more than 30.', () => {
    let leftCoupleIndexes: any,
      rightCoupleIndexes: any,
      questionCount = 6;
    for (let i = 0; i < 100; i++) {
      chai.expect(FunctionObj.createNextIndex(questionCount, [])).to.not.throw(Error)
      chai.expect(FunctionObj.createNextIndex(questionCount, [leftCoupleIndexes])).to.not.throw(Error)
    }
  })
})

describe('Tests correctness', () => {
  // ----------------------------------------------------------------------------------
  it('getG2Gtest_OneAnswerGraph. 1 question, 1 correct answer, 3 incorrect answers', () => {
    let test: any;
    for (let i = 0; i < 100; i++) {
      test = tests.getG2Gtest_OneAnswerGraph(0);
      chai.expect(test.question.graph.length).to.be.equalTo(1);
      chai.expect(test.question.correctIDs.length).to.be.equalTo(1);
      chai.expect(test.answers.length).to.be.equalTo(4);
    }
  })
  // ----------------------------------------------------------------------------------
  it('getG2Gtest_TwoAnswerGraph. 1 question, 2 correct answer, 2 incorrect answers', () => {
    let test: any;
    for (let i = 0; i < 100; i++) {
      test = tests.getG2Gtest_TwoAnswerGraph(0);
      chai.expect(test.question.graph.length).to.be.equalTo(1);
      chai.expect(test.question.correctIDs.length).to.be.equalTo(2);
      chai.expect(test.answers.length).to.be.equalTo(4);
    }
  })
  // ----------------------------------------------------------------------------------
  it('getG2Stest_SimpleFunctions. 4 simple question, 4 simple answers', () => {
    let test: any;
    for (let i = 0; i < 100; i++) {
      test = tests.getG2Stest_SimpleFunctions(0);
      chai.expect(test.question.length).to.be.equalTo(4);
      for (let j = 0; j < 4; j++) {
        chai.expect(test.question[i].graph.length).to.be.equalTo(1);
        chai.expect(test.question[i].correctIDs.length).to.be.equalTo(1);
      }
      chai.expect(test.answers.length).to.be.equalTo(4);
      for (let j = 0; j < 4; j++) {
        chai.expect(test.answers[i].text).to.not.be.null;
        chai.expect(test.answers[i].id).to.not.be.null;
      }
    }
  })
  // ----------------------------------------------------------------------------------
  it('getG2Stest_ComplexFunctions. 4 complex question, 4 complex answers.', () => {
    let test: any;
    for (let i = 0; i < 100; i++) {
      test = tests.getG2Stest_ComplexFunctions(0);
      chai.expect(test.question.length).to.be.equalTo(4);
      for (let j = 0; j < 4; j++) {
        chai.expect(test.question[i].graph.length).to.be.equalTo(2);
        chai.expect(test.question[i].correctIDs.length).to.be.equalTo(1);
      }
      chai.expect(test.answers.length).to.be.equalTo(4);
      for (let j = 0; j < 4; j++) {
        chai.expect(test.answers[i].text).to.not.be.null;
        chai.expect(test.answers[i].id).to.not.be.null;
      }
    }
  })
  // ----------------------------------------------------------------------------------
  it('getSGtest(true). 1 complex question,  3 simple answers.', () => {
    let test: any;
    for (let i = 0; i < 100; i++) {
      test = tests.getSGtest(0, true);
      chai.expect(test.question.graph.length).to.be.lessThan(5);
      chai.expect(test.question.graph.length).to.be.greaterThan(3);

      chai.expect(test.answers.length).to.be.equalTo(3);
      for (let j = 0; j < 4; j++) {
        chai.expect(test.answers[i].id).to.not.be.null;
        chai.expect(test.answers[i].letter).to.not.be.equalTo('');
        chai.expect(test.answers[i].leftIndex).to.not.be.null;
        chai.expect(test.answers[i].rightIndex).to.not.be.null;
        chai.expect(test.answers[i].correctSign).to.satisfy(function(sign) {
          return sign === -1 || sign === 0 || sign === 1;
        });
      }
    }
  })
  // ----------------------------------------------------------------------------------
  it('getSGtest(false). 1 complex question,  6 complex answers.', () => {
    let test: any;
    for (let i = 0; i < 100; i++) {
      test = tests.getSGtest(0, true);
      chai.expect(test.question.graph.length).to.be.lessThan(5);
      chai.expect(test.question.graph.length).to.be.greaterThan(3);

      chai.expect(test.answers.length).to.be.equalTo(6);
      for (let j = 0; j < 4; j++) {
        chai.expect(test.answers[i].id).to.not.be.null;
        chai.expect(test.answers[i].letter).to.be.equalTo('');
        chai.expect(test.answers[i].leftIndex).to.not.be.null;
        chai.expect(test.answers[i].rightIndex).to.not.be.null;
        chai.expect(test.answers[i].correctSign).to.satisfy(function(sign) {
          return sign === -1 || sign === 0 || sign === 1;
        });
      }
    }
  })
})
