import FunctionObj from "../src/FunctionObj";

const chai = require('chai');
const test = require('firebase-functions-test')();
import * as tests from "../src/index"
import getSGtest from "../src";


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
        for (let i = 0; i < 100; i++) {
            let question = new FunctionObj().makeQuestionFunction(["x"], []);
            let correct_array = Array<FunctionObj>();
            correct_array.push(question.getCorrectFunction(["x", "v"], correct_array));
            correct_array.push(question.getCorrectFunction(["x", "v", "a"], correct_array));

            chai.expect(correct_array[0].funcType).to.equal("v");
            chai.expect(correct_array[1].funcType).to.equal("a");
        }
    });
    it("Correct functions should be Correct", () => {
        for (let i = 0; i < 100; i++) {
            let question = new FunctionObj().makeQuestionFunction(["x"], []);
            let correct_array = Array<FunctionObj>();
            correct_array.push(question.getCorrectFunction(["x", "v"], correct_array));
            correct_array.push(question.getCorrectFunction(["x", "v", "a"], correct_array));

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
        for (let i = 0; i < 100; i++) {
            let question = new FunctionObj().makeQuestionFunction(["x"], []);
            let incorrect_array = Array<FunctionObj>();
            for (let k = 0; k < 6; k++) {
                incorrect_array.push(question.getIncorrectFunction(["x", "v", "a"], incorrect_array));
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
        for(let i = 0; i < 100;i++){
            axis = availableAxises.getRandom();
            if(axis == "x") x_c++;
            if(axis == "v") v_c++;
            if(axis == "a") a_c++;
        }
        console.log("x: ", x_c, ", v: ", v_c, ", a: ", a_c);
    });
    it("SG test graphs should have more than 2 functions", () => {
        let a: any;
        for(let i = 0; i < 100;i++){
            a = getSGtest(i, true);
            chai.expect(a.question[0].graph.length).to.be.greaterThan(2);
        }
    });
    it("Check for SG test copy bug", () => {
        for (let i = 0; i < 10; i++) {
            let test = getSGtest(i, true);
            chai.expect(test.question[0].graph[0].params).haveOwnProperty("len");
            chai.expect(test.question[0].graph[0].params.len).to.be.greaterThan(0);
        }
    });
});