const chai = require('chai');
const test = require('firebase-functions-test')();
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