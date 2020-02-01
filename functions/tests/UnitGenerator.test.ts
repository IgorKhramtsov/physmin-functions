import {UnitFirst} from "../src/UnitFirst"
import chai = require('chai');
import { FunctionBuilder } from "../src/Function/FunctionBuilder";
import { FunctionObj } from "../src/Function/FunctionObj";

describe("Function generators", () => {
    
    it('All functions should not throw any exceptions. ', () => {
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
    it('All functions should be stringifyable. ', () => {
        for (let i = 0; i < 100; ++i) {
            chai.expect(() => JSON.stringify(UnitFirst.getG2Gtest_OneAnswerGraph(0))).to.not.throw(Error);
            chai.expect(() => JSON.stringify(UnitFirst.getG2Gtest_TwoAnswerGraph(0))).to.not.throw(Error);
            chai.expect(() => JSON.stringify(UnitFirst.getG2Stest_ComplexFunctions(0))).to.not.throw(Error);
            chai.expect(() => JSON.stringify(UnitFirst.getG2Stest_MixedFunctions(0,0.5))).to.not.throw(Error);
            chai.expect(() => JSON.stringify(UnitFirst.getG2Stest_SimpleFunctions(0))).to.not.throw(Error);
            chai.expect(() => JSON.stringify(UnitFirst.getSGtest_ComplexAnswers(0))).to.not.throw(Error);
            chai.expect(() => JSON.stringify(UnitFirst.getSGtest_SimpleAnswers(0))).to.not.throw(Error);
        }
    });
});