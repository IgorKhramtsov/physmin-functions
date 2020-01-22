import {FunctionObj} from './Function/FunctionObj'
import {Config} from "./Config";
import {Utils} from "./Util";
import {FunctionBuilder} from './Function/FunctionBuilder'

import {getSGtest} from "./Tasks/SG";
import {getG2Gtest} from "./Tasks/G2G";
import {getG2Stest} from "./Tasks/G2S";

export class UnitFirst {

    static getG2Gtest_OneAnswerGraph(test_id: number) {
        return getG2Gtest(test_id, 1);
    }

    static getG2Gtest_TwoAnswerGraph(test_id: number) {
        return getG2Gtest(test_id, 2);
    }

    static getG2Stest_SimpleFunctions(test_id: number) {
        return getG2Stest(test_id, 0);
    }

    static getG2Stest_ComplexFunctions(test_id: number) {
        return getG2Stest(test_id, 1);
    }

    static getG2Stest_MixedFunctions(test_id: number, ComplexChance: number) {
        return getG2Stest(test_id, ComplexChance);
    }

    static getSGtest_SimpleAnswers(test_id: number = 9) {
        return getSGtest(test_id, true);
    }

    static getSGtest_ComplexAnswers(test_id: number) {
        return getSGtest(test_id, false);
    }
}
