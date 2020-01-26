import {UnitFirst as tests} from "../src/UnitFirst";
import chai = require('chai');

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

    it('Sign to Graph(simple answers) should not throw any exceptions.', () => {
        for (let i = 0; i < 100; i++) {
            chai.expect(() => tests.getSGtest_SimpleAnswers(0)).to.not.throw(Error);
        }
    });
    it('Sign to Graph(complex answers) should not throw any exceptions.', () => {
        for (let i = 0; i < 100; i++) {
            chai.expect(() => tests.getSGtest_ComplexAnswers(0)).to.not.throw(Error);
        }
    })
});