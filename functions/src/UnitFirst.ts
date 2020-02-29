import {getRStest} from "./Tasks/RS";
import {getG2Gtest} from "./Tasks/G2G";
import {getS2Gtest} from "./Tasks/S2G";

export class UnitFirst {

    static getG2Gtest_OneAnswerGraph(test_id: number) {
        return getG2Gtest(test_id);
    }

    static getG2Gtest_TwoAnswerGraph(test_id: number) {
        return getG2Gtest(test_id);
    }

    static getS2Gtest_SimpleFunctions(test_id: number) {
        return getS2Gtest(test_id);
    }

    static getS2Gtest_ComplexFunctions(test_id: number) {
        return getS2Gtest(test_id);
    }

    static getS2Gtest_MixedFunctions(test_id: number, ComplexChance: number) {
        return getS2Gtest(test_id);
    }

    static getRStest_SimpleAnswers(test_id: number) {
        return getRStest(test_id);
    }

    static getRStest_ComplexAnswers(test_id: number) {
        return getRStest(test_id);
    }
}
