import {Config} from "../src/Config";
import {UnitFirst as tests} from "../src/UnitFirst";
import chai = require('chai');

describe('Tests correctness, COMPOSITION', () => {
    it('getG2Gtest_OneAnswerGraph. 1 question, 1 correct answer, 3 incorrect answers', () => {
        let test: any,
            questionCount = Config.Tasks.G2G.questionCount,
            answersCount = Config.Tasks.G2G.answersCount,
            correctIDsCount = 1;
        for (let i = 0; i < 100; ++i) {
            test = tests.getG2Gtest_OneAnswerGraph(0);
            chai.expect(test.question.graph.length).to.be.equal(questionCount);
            chai.expect(test.question.correctIDs.length).to.be.equal(correctIDsCount);
            chai.expect(test.answers.length).to.be.equal(answersCount);
        }
    });
    it('getG2Gtest_TwoAnswerGraph. 1 question, 2 correct answer, 2 incorrect answers', () => {
        let test: any,
            questionCount = Config.Tasks.G2G.questionCount,
            answersCount = Config.Tasks.G2G.answersCount,
            correctIDsCount = 2;

        for (let i = 0; i < 100; ++i) {
            test = tests.getG2Gtest_TwoAnswerGraph(0);
            chai.expect(test.question.graph.length).to.be.equal(questionCount);
            chai.expect(test.question.correctIDs.length).to.be.equal(correctIDsCount);
            chai.expect(test.question.correctIDs[0] !== test.question.correctIDs[1]);
            chai.expect(test.answers.length).to.be.equal(answersCount);
        }
    });
    it('getG2Stest_SimpleFunctions. 4 simple question, 6 simple answers', () => {
        let test: any,
            questionCount = Config.Tasks.G2S.questionCount,
            answersCount = Config.Tasks.G2S.answersCount;
        for (let i = 0; i < 100; i++) {
            test = tests.getG2Stest_SimpleFunctions(0);

            chai.expect(test.question.length).to.be.equal(questionCount);
            for (let j = 0; j < questionCount; ++j) {
                chai.expect(test.question[j].graph.length).to.be.equal(1);
                chai.expect(test.question[j].correctIDs.length).to.be.not.equal(0);
            }

            chai.expect(test.answers.length).to.be.equal(answersCount);
            for (let j = 0; j < answersCount; ++j) {
                chai.expect(test.answers[j].text).to.not.be.null;
                chai.expect(test.answers[j].id).to.not.be.null;
            }
        }
    });
    it('getG2Stest_ComplexFunctions. 4 complex question, 4 complex answers.', () => {
        let test: any,
            questionCount = Config.Tasks.G2S.questionCount,
            answersCount = Config.Tasks.G2S.answersCount;
        for (let i = 0; i < 100; ++i) {
            test = tests.getG2Stest_ComplexFunctions(0);

            chai.expect(test.question.length).to.be.equal(questionCount);
            for (let j = 0; j < questionCount; ++j) {
                chai.expect(test.question[j].graph.length).to.be.equal(2);
                chai.expect(test.question[j].correctIDs.length).to.be.not.equal(0);
            }

            chai.expect(test.answers.length).to.be.equal(answersCount);
            for (let j = 0; j < answersCount; ++j) {
                chai.expect(test.answers[j].text).to.not.be.null;
                chai.expect(test.answers[j].id).to.not.be.null;
            }
        }
    });
    it('getSGtest_SimpleAnswers. 1 complex question,  3 simple answers.', () => {
        let test: any,
            lowerBound = Config.Tasks.S2G.questionCount[0],
            upperBound = Config.Tasks.S2G.questionCount[1],
            answersCount = Config.Tasks.S2G.simple.answersCount;
        for (let i = 0; i < 100; ++i) {
            test = tests.getSGtest_SimpleAnswers(0);

            chai.expect(test.question[0].graph.length).to.be.at.most(upperBound);
            chai.expect(test.question[0].graph.length).to.be.at.least(lowerBound);

            chai.expect(test.answers.length).to.be.equal(answersCount);
            for (let j = 0; j < answersCount; ++j) {
                chai.expect(test.answers[j].id).to.not.be.null;
                chai.expect(test.answers[j].letter).to.not.be.equal('');
                chai.expect(test.answers[j].leftIndex).to.not.be.null;
                chai.expect(test.answers[j].rightIndex).to.not.be.null;
                chai.expect(test.answers[j].correctSign).to.oneOf([-1, 0, 1]);
            }
        }
    });
    it('getSGtest_ComplexAnswers. 1 complex question,  6 complex answers.', () => {
        let test: any,
            lowerBound = Config.Tasks.S2G.questionCount[0],
            upperBound = Config.Tasks.S2G.questionCount[1],
            answersCount = Config.Tasks.S2G.complex.answersCount;
        for (let i = 0; i < 100; ++i) {
            test = tests.getSGtest_ComplexAnswers(0);

            chai.expect(test.question[0].graph.length).to.be.at.most(upperBound);
            chai.expect(test.question[0].graph.length).to.be.at.least(lowerBound);

            chai.expect(test.answers.length).to.be.equal(answersCount);
            for (let j = 0; j < answersCount; ++j) {
                chai.expect(test.answers[j].id).to.not.be.null;
                chai.expect(test.answers[j].letter).to.not.be.equal('');
                chai.expect(test.answers[j].leftIndex).to.not.be.null;
                chai.expect(test.answers[j].rightIndex).to.not.be.null;
                chai.expect(test.answers[j].correctSign).to.oneOf([-1, 0, 1]);
            }
        }
    });
    it('getG2Stest. 4 unique correct IDs', () => {
        let simpleTest: any,
            complexTest: any,
            simpleTestCorrectIDs: any,
            complexTestCorrectIDs: any;
        for (let i = 0; i < 100; ++i) {
            simpleTest = tests.getG2Stest_SimpleFunctions(i);
            complexTest = tests.getG2Stest_ComplexFunctions(i);
            simpleTestCorrectIDs = Array<number>();
            complexTestCorrectIDs = Array<number>();

            for (let j = 0; j < Config.Tasks.G2S.questionCount; ++j) {

                for (let id of simpleTest.question[j].correctIDs)
                    if (!simpleTestCorrectIDs.contains(id))
                        simpleTestCorrectIDs.push(id);

                for (let id of complexTest.question[j].correctIDs)
                    if (!complexTestCorrectIDs.contains(id))
                        complexTestCorrectIDs.push(id);
            }
            chai.expect(simpleTestCorrectIDs.length).to.be.equal(4);
            chai.expect(complexTestCorrectIDs.length).to.be.equal(4);
        }
    })
});

describe('Tests correctness, FUNCTION LENGTH', () => {
    it('getG2Gtest. Question and answers functions should have correct length', () => {
        let test: any,
            defaultLength = Config.Limits.defaultLength;
        for (let i = 0; i < 100; ++i) {
            test = tests.getG2Gtest_OneAnswerGraph(i);
            chai.expect(test.question.graph[0].params.len).to.be.equal(defaultLength);
            for (let j = 0; j < Config.Tasks.G2G.answersCount; ++j)
                chai.expect(test.answers[j].graph[0].params.len).to.be.equal(defaultLength);
        }
    });
    it('getG2Stest_SimpleFunctions. Question functions should have correct length', () => {
        let test: any;
        for (let i = 0; i < 100; ++i) {
            test = tests.getG2Stest_SimpleFunctions(i);
            for (let j = 0; j < Config.Tasks.G2S.answersCount; ++j)
                chai.expect(test.question[j].graph[0].params.len).to.be.equal(Config.Limits.defaultLength);
        }
    });
    it('getG2Stest_ComplexFunctions. Question functions should have correct length', () => {
        let test: any,
            defaultLength = Config.Limits.defaultLength;
        for (let i = 0; i < 100; ++i) {
            test = tests.getG2Stest_ComplexFunctions(i);

            for (let j = 0; j < Config.Tasks.G2S.answersCount; ++j) {
                chai.expect(test.question[j].graph[0].params.len).to.be.equal(defaultLength / 2);
                chai.expect(test.question[j].graph[1].params.len).to.be.equal(defaultLength / 2);
            }
        }
    });
    it('getSGtest_SimpleAnswers. Question and answers functions should have correct length', () => {
        let test: any,
            cumLength: number;
        for (let i = 0; i < 100; ++i) {
            cumLength = 0;
            test = tests.getSGtest_SimpleAnswers(i);

            for (let j = 0; j < test.question[0].graph.length; ++j)
                cumLength += test.question[0].graph[j].params.len;
            chai.expect(cumLength).to.be.equal(Config.Limits.defaultLength);
        }
    });
    it('getSGtest_ComplexAnswers. Question and answers functions should have correct length', () => {
        let test: any,
            cumLength: number;
        for (let i = 0; i < 100; ++i) {
            cumLength = 0;
            test = tests.getSGtest_ComplexAnswers(i);

            for (let j = 0; j < test.question[0].graph.length; ++j)
                cumLength += test.question[0].graph[j].params.len;
            chai.expect(cumLength).to.be.equal(Config.Limits.defaultLength);
        }
    });
});
