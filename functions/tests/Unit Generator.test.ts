import {UnitFirst} from "../src/UnitFirst"
import chai = require('chai');

describe("Function generators", () => {
    
    it('All functions should not throw any exceptions. ', () => {
        UnitFirst.getG2Gtest_OneAnswerGraph(0)
        for (let i = 0; i < 100; ++i) {
            chai.expect(() => UnitFirst.getG2Gtest_OneAnswerGraph(0)).to.not.throw(Error);
            chai.expect(() => UnitFirst.getG2Gtest_TwoAnswerGraph(0)).to.not.throw(Error);
            chai.expect(() => UnitFirst.getG2Stest_ComplexFunctions(0)).to.not.throw(Error);
            chai.expect(() => UnitFirst.getG2Stest_MixedFunctions(0,0.5)).to.not.throw(Error);
            chai.expect(() => UnitFirst.getG2Stest_SimpleFunctions(0)).to.not.throw(Error);
            chai.expect(() => UnitFirst.getSGtest_ComplexAnswers(0)).to.not.throw(Error);
            chai.expect(() => UnitFirst.getSGtest_SimpleAnswers(0)).to.not.throw(Error);
        }
    });
});