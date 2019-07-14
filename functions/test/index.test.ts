import chai = require('chai');
import { FunctionObj } from "../src/FunctionObj";
import { Config } from "../src/Config";
import { UnitFirst as tests } from "../src/UnitFirst"

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
  it('Sign to Graph(simple answers) shoud not throw any exceptions.', () => {
    for (let i = 0; i < 100; i++) {
      chai.expect(() => tests.getSGtest_SimpleAnswers(0)).to.not.throw(Error);
    }
  })
  it('Sign to Graph(complex answers) shoud not throw any exceptions.', () => {
    for (let i = 0; i < 100; i++) {
      chai.expect(() => tests.getSGtest_ComplexAnswers(0)).to.not.throw(Error);
    }
  })
});

describe("Function generators", () => {
  it("Correct function should have right types", () => {
    let question: any,
      correct_array: any;
    for (let i = 0; i < 100; i++) {
      question = new FunctionObj().makeQuestionFunction(undefined, undefined, ["x"]);
      correct_array = Array<FunctionObj>();

      correct_array.push(question.getCorrectFunction(correct_array, undefined, ["x", "v"]));
      correct_array.push(question.getCorrectFunction(correct_array, undefined, ["x", "v", "a"]));

      chai.expect(correct_array[0].funcType).to.be.equal("v");
      chai.expect(correct_array[1].funcType).to.be.equal("a");
    }
  });
  it("Correct functions should be Correct", () => {
    let question: any,
      correct_array: any;
    for (let i = 0; i < 100; i++) {
      question = new FunctionObj().makeQuestionFunction(undefined, undefined, ["x"]);
      correct_array = Array<FunctionObj>();

      correct_array.push(question.getCorrectFunction(correct_array, undefined, ["x", "v"]));
      correct_array.push(question.getCorrectFunction(correct_array, undefined, ["x", "v", "a"]));

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
    let question: any,
      incorrect_array: any;
    for (let i = 0; i < 100; i++) {
      question = new FunctionObj().makeQuestionFunction(undefined, undefined, ["x"]);
      incorrect_array = Array<FunctionObj>();
      for (let k = 0; k < 6; k++) {
        incorrect_array.push(question.getIncorrectFunction(incorrect_array));
        let incorrectFunctionToCompare = new FunctionObj(question.funcType, incorrect_array[k].copyParams());
        incorrectFunctionToCompare.params.x = question.params.x;
        if (incorrect_array[k].funcType == "a") incorrectFunctionToCompare.params.v = question.params.v;

        chai.expect(incorrectFunctionToCompare.equalTo(question)).to.be.false;
      }
    }
  });
  it("getSGtest_SimpleAnswers. Check for copy bug", () => {
    let test: any;
    for (let i = 0; i < 10; i++) {
      // test = tests.getSGtest_SimpleAnswers.bind(null, 0)();
      test = tests.getSGtest_SimpleAnswers.bind(null, 0)();
      chai.expect(test.question[0].graph[0].params).haveOwnProperty("len");
      chai.expect(test.question[0].graph[0].params.len).to.be.greaterThan(0);
    }
  });
  it("Generated functions should not going out of bounds", () => {
    let question = new FunctionObj().makeQuestionFunction(undefined, undefined, ["x"]);
    let func: FunctionObj;
    for (let i = 0; i < 100; i++) {
      func = question.getCorrectFunction();
      for (const param of Object.keys(func.params).deleteItem("len"))
        chai.expect(func.params[param]).to.be.at.least(Config.bounds[param][0]).and.at.most(Config.bounds[param][1]);
      func = question.getIncorrectFunction();
      for (const param of Object.keys(func.params).deleteItem("len"))
        chai.expect(func.params[param]).to.be.at.least(Config.bounds[param][0]).and.at.most(Config.bounds[param][1]);
    }
  });
});

describe('Minor functions', () => {
  // ----------------------------------------------------------------------------------
  it('createNextFunction should not throw any exceptions.', () => {
    let question: any;
    for (let i = 0; i < 100; i++) {
      question = new FunctionObj().
        makeQuestionFunction(undefined, Config.defaultLength / 2).
        getCorrectFunction(undefined, Config.defaultLength / 2);
      chai.expect(() => question.createNextFunction(undefined, Config.defaultLength / 2)).to.not.throw(Error);
    }
  })
  it('createNextFunction should return function that have opposite direction than function that did call.', () => {
    let question: any,
      nextFunc: any;

    for (let i = 0; i < 100; i++) {
      question = new FunctionObj().
        makeQuestionFunction(undefined, Config.defaultLength / 2).
        getCorrectFunction(undefined, Config.defaultLength / 2);
      nextFunc = question.createNextFunction(undefined, Config.defaultLength / 2)
      chai.expect(nextFunc.equalTo(question)).to.be.false;
      chai.expect(nextFunc.equalToByDirection(question)).to.be.false;
    }
  })
  // ----------------------------------------------------------------------------------
  it('snapToGrid should not throw any exceptions.', () => {
    for (let i = 0; i < 100; i++) {
      chai.expect(() => new FunctionObj().makeQuestionFunction(undefined, Config.defaultLength / 2)).to.not.throw(Error);
    }
  })
  // ----------------------------------------------------------------------------------
  it('createNextCoupleIndexes should not throw any exceptions.', () => {
    let indexes = Array<Array<Array<number>>>(),
      questionCount = 5;
    for (let i = 0; i < 100; i++)
      chai.expect(() => FunctionObj.createNextCoupleIndexes(questionCount, indexes)).to.not.throw(Error);
  })
  it('createNextIndex should not have infinite cycle.', () => {
    let leftCoupleIndexes: any,
      questionCount = 6;

    for (let i = 0; i < 100; i++) {
      chai.expect(() => leftCoupleIndexes = FunctionObj.createNextIndex(questionCount)).to.not.throw(Error)
      chai.expect(() => FunctionObj.createNextIndex(questionCount, [leftCoupleIndexes])).to.not.throw(Error)
    }
  })
})

describe.only('Tests correctness', () => {
  // ----------------------------------------------------------------------------------
  it('getG2Gtest_OneAnswerGraph. 1 question, 1 correct answer, 3 incorrect answers', () => {
    let test: any;
    for (let i = 0; i < 10; i++) {
      test = tests.getG2Gtest_OneAnswerGraph(0);
      chai.expect(test.question.graph.length).to.be.equal(1);
      chai.expect(test.question.correctIDs.length).to.be.equal(1);
      chai.expect(test.answers.length).to.be.equal(6);

    }
  })
  // ----------------------------------------------------------------------------------
  it('getG2Gtest_TwoAnswerGraph. 1 question, 2 correct answer, 2 incorrect answers', () => {
    let test: any;
    for (let i = 0; i < 100; i++) {
      test = tests.getG2Gtest_TwoAnswerGraph(0);
      chai.expect(test.question.graph.length).to.be.equal(1);
      chai.expect(test.question.correctIDs.length).to.be.equal(2);
      chai.expect(test.answers.length).to.be.equal(6);
    }
  })
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
  })
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
  })
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
  })
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
  })
})
