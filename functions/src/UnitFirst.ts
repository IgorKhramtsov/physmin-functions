import {getRStask} from "./Tasks/RS";
import {getG2Gtask} from "./Tasks/G2G";
import {getS2Gtask} from "./Tasks/S2G";

export class UnitFirst {

    static getG2Gtest_OneAnswerGraph(test_id: number) {
        return getG2Gtask(test_id);
    }

    static getG2Gtest_TwoAnswerGraph(test_id: number) {
        return getG2Gtask(test_id);
    }

    static getS2Gtest_SimpleFunctions(test_id: number) {
        return getS2Gtask(test_id);
    }

    static getS2Gtest_ComplexFunctions(test_id: number) {
        return getS2Gtask(test_id);
    }

    static getS2Gtest_MixedFunctions(test_id: number, ComplexChance: number) {
        return getS2Gtask(test_id);
    }

    static getRStest_SimpleAnswers(test_id: number) {
        return getRStask(test_id);
    }

    static getRStest_ComplexAnswers(test_id: number) {
        return getRStask(test_id);
    }
}
