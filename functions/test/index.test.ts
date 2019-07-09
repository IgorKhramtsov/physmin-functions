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
  it("All axises should be picked with equal possibility", () => {
    let availableAxises = ["x", "v", "a"],
      axis: string,
      x_c = 0,
      v_c = 0,
      a_c = 0;
    for (let i = 0; i < 100; i++) {
      axis = availableAxises.getRandom();
      if (axis == "x") x_c++;
      if (axis == "v") v_c++;
      if (axis == "a") a_c++;
    }
    console.log("x: ", x_c, ", v: ", v_c, ", a: ", a_c);
  });
  it("SG test graphs should have more than 2 functions", () => {
    let a: any;
    for (let i = 0; i < 100; i++) {
      a = tests.getSGtest(i, true);
      chai.expect(a.question[0].graph.length).to.be.greaterThan(2);
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
  it('createNextFunction should not have recursive count more than 30.', () => {
    let _funcLength = Config.defaultLength,
      question: any,
      nextFunc: any,
      recursive_count = 0;
    for (let i = 0; i < 100; i++) {
      question = new FunctionObj().
        makeQuestionFunction(Config.axisIndexes, _funcLength / 2).
        getCorrectFunction(Config.axisIndexes, _funcLength / 2);
      nextFunc = question.createNextFunction([], _funcLength / 2, recursive_count)
      chai.expect(recursive_count < 30).to.be.true;
      recursive_count = 0;
    }
  })
  // ----------------------------------------------------------------------------------
  it('snapToGrid should not throw any exceptions.', () => {
    let _funcLength = Config.defaultLength,
      question: any;

    // Copy of makeQuestionFunction hence original returns this.snapToGrid()
    function makeQuestionFunction_test(question_: FunctionObj, availableAxises: Array<string>,
      funcLength: number, usedFuncs?: Array<FunctionObj>): FunctionObj {

      question_.funcType = availableAxises.getRandom();
      question_.generateParams().clearParams();

      if (usedFuncs)
        for (const func of usedFuncs)
          if (question_.equalTo(func))
            return this.makeQuestionFunction(availableAxises, funcLength, usedFuncs);

      question_.params.len = funcLength;
      return question_;
    }

    for (let i = 0; i < 100; i++) {
      question = new FunctionObj();
      question = makeQuestionFunction_test(question, Config.axisIndexes, _funcLength / 2)

      chai.expect(question.snapToGrid).to.not.throw(Error);
    }
  })
  // ----------------------------------------------------------------------------------
  it('createNextCoupleIndexes should not have recursive count more than 30', () => {
    let indexes = Array<Array<Array<number>>>(),
      answersCount = 6,
      questionCount = 5,
      recursive_count = 0;
    for (let i = 0; i < 100; i++) {

      for (let i = 0; i < answersCount; i++) {
        indexes.push(FunctionObj.createNextCoupleIndexes(questionCount, indexes, recursive_count));
      }
      chai.expect(recursive_count < 30).to.be.true;
      recursive_count = 0;
    }
  })
  it('createNextIndex should not have cicle count more than 30.', () => {
    let leftCoupleIndexes: any,
      rightCoupleIndexes: any,
      questionCount = 6,
      cicle_count1 = 0,
      cicle_count2 = 0;
    for (let i = 0; i < 100; i++) {
      leftCoupleIndexes = FunctionObj.createNextIndex(questionCount, [], cicle_count1),
        rightCoupleIndexes = FunctionObj.createNextIndex(questionCount, [leftCoupleIndexes], cicle_count2);
      chai.expect(cicle_count1 < 30).to.be.true;
      chai.expect(cicle_count2 < 30).to.be.true;
      cicle_count1 = 0;
      cicle_count2 = 0;
    }
  })
})

describe('Tests correctness', () => {
  // ----------------------------------------------------------------------------------
  it('getG2Gtest_OneAnswerGraph. 1 question, 1 correct answer, 3 incorrect answers', () => {
    let test: any;
    for (let i = 0; i < 100; i++) {
      test = tests.getG2Gtest_OneAnswerGraph(0);
      chai.expect(test.question.graph.length === 1).to.be.true;
      chai.expect(test.question.correctIDs.length === 1).to.be.true;
      chai.expect(test.answers.length === 4).to.be.true;
    }
  })
  // correct
  // incorrect
  // ----------------------------------------------------------------------------------
  it('getG2Gtest_TwoAnswerGraph. 1 question, 2 correct answer, 2 incorrect answers', () => {
    let test: any;
    for (let i = 0; i < 100; i++) {
      test = tests.getG2Gtest_TwoAnswerGraph(0);
      chai.expect(test.question.graph.length === 1).to.be.true;
      chai.expect(test.question.correctIDs.length === 2).to.be.true;
      chai.expect(test.answers.length === 4).to.be.true;
    }
  })
  // correct
  // incorrect
  // ----------------------------------------------------------------------------------
  it('getG2Stest_SimpleFunctions. 4 simple question, 4 simple answers', () => {
    let test: any;
    for (let i = 0; i < 100; i++) {
      test = tests.getG2Stest_SimpleFunctions(0);
      chai.expect(test.question.length === 4).to.be.true;
      for (let j = 0; j < 4; j++) {
        chai.expect(test.question[i].graph.length === 1).to.be.true;
        chai.expect(test.question[i].correctIDs.length === 1).to.be.true;
      }
      chai.expect(test.answers.length === 4).to.be.true;
      for (let j = 0; j < 4; j++) {
        chai.expect(test.answers[i].text !== null).to.be.true;
        chai.expect(test.answers[i].id !== null).to.be.true;
      }
    }
  })
  // ----------------------------------------------------------------------------------
  it('getG2Stest_ComplexFunctions. 4 complex question, 4 complex answers.', () => {
    let test: any;
    for (let i = 0; i < 100; i++) {
      test = tests.getG2Stest_ComplexFunctions(0);
      chai.expect(test.question.length === 4).to.be.true;
      for (let j = 0; j < 4; j++) {
        chai.expect(test.question[i].graph.length === 2).to.be.true;
        chai.expect(test.question[i].correctIDs.length === 1).to.be.true;
      }
      chai.expect(test.answers.length === 4).to.be.true;
      for (let j = 0; j < 4; j++) {
        chai.expect(test.answers[i].text !== null).to.be.true;
        chai.expect(test.answers[i].id !== null).to.be.true;
      }
    }
  })
  // ----------------------------------------------------------------------------------
  it('getSGtest(true). 1 complex question,  3 simple answers.', () => {
    let test: any;
    for (let i = 0; i < 100; i++) {
      test = tests.getSGtest(0, true);
      chai.expect((3 <= test.question.graph.length) && (test.question.graph.length <= 5)).to.be.true;

      chai.expect(test.answers.length === 3).to.be.true;
      for (let j = 0; j < 4; j++) {
        chai.expect(test.answers[i].id !== null).to.be.true;
        chai.expect(test.answers[i].letter !== "").to.be.true;
        chai.expect(test.answers[i].leftIndex !== null).to.be.true;
        chai.expect(test.answers[i].rightIndex !== null).to.be.true;
        chai.expect((test.answers[i].correctSign === -1)||
                    (test.answers[i].correctSign === 0) ||
                    (test.answers[i].correctSign === 1) ).to.be.true;
      }
    }
  })
  // ----------------------------------------------------------------------------------
  it('getSGtest(true). 1 complex question,  6 complex answers.', () => {

  })
})
