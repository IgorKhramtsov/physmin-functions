// import {Config} from "../src/Config";
// import {UnitFirst as tests} from "../src/UnitFirst";
// import chai = require('chai');


// // considering that tests should be very agile, so we can ask for 1 question with 2 answers total, this tests is under the question.
// describe('Tests correctness, COMPOSITION', () => {
//     it('getG2Gtest_OneAnswerGraph. 1 question, 1 correct answer, 3 incorrect answers', () => {
//         let test: any,
//             questionCount = 1,
//             answersCount = Config.Tasks.G2G.answersCount,
//             correctIDsCount = 1;
//         for (let i = 0; i < 100; ++i) {
//             test = tests.getG2Gtest_OneAnswerGraph(0);
//             chai.expect(test.question.graph.length).to.be.equal(questionCount);
//             chai.expect(test.question.correctIDs.length).to.be.equal(correctIDsCount);
//             chai.expect(test.answers.length).to.be.equal(answersCount);
//         }
//     });
//     it('getG2Gtest_TwoAnswerGraph. 1 question, 2 correct answer, 2 incorrect answers', () => {
//         let test: any,
//             questionCount = 1,
//             answersCount = Config.Tasks.G2G.answersCount,
//             correctIDsCount = 2;

//         for (let i = 0; i < 100; ++i) {
//             test = tests.getG2Gtest_TwoAnswerGraph(0);
//             chai.expect(test.question.graph.length).to.be.equal(questionCount);
//             chai.expect(test.question.correctIDs.length).to.be.equal(correctIDsCount);
//             chai.expect(test.question.correctIDs[0] !== test.question.correctIDs[1]);
//             chai.expect(test.answers.length).to.be.equal(answersCount);
//         }
//     });
//     it('getS2Gtest_SimpleFunctions. 4 simple question, 4 simple answers', () => {
//         let test: any,
//             questionCount = Config.Tasks.S2G.answersCount,
//             answersCount = Config.Tasks.S2G.answersCount;
//         for (let i = 0; i < 100; i++) {
//             test = tests.getS2Gtest_SimpleFunctions(0);

//             chai.expect(test.question.length).to.be.equal(questionCount);
//             for (let j = 0; j < questionCount; ++j) {
//                 chai.expect(test.question[j].graph.length).to.be.equal(1);
//                 chai.expect(test.question[j].correctIDs.length).to.be.not.equal(0);
//             }

//             chai.expect(test.answers.length).to.be.equal(answersCount);
//             for (let j = 0; j < answersCount; ++j) {
//                 chai.expect(test.answers[j].text).to.not.be.null;
//                 chai.expect(test.answers[j].id).to.not.be.null;
//             }
//         }
//     });
//     it('getS2Gtest_ComplexFunctions. 4 complex question, 4 complex answers.', () => {
//         let test: any,
//             questionCount = Config.Tasks.S2G.answersCount,
//             answersCount = Config.Tasks.S2G.answersCount;
//         for (let i = 0; i < 100; ++i) {
//             test = tests.getS2Gtest_ComplexFunctions(0);

//             chai.expect(test.question.length).to.be.equal(questionCount);
//             for (let j = 0; j < questionCount; ++j) {
//                 chai.expect(test.question[j].graph.length).to.be.equal(2);
//                 chai.expect(test.question[j].correctIDs.length).to.be.not.equal(0);
//             }

//             chai.expect(test.answers.length).to.be.equal(answersCount);
//             for (let j = 0; j < answersCount; ++j) {
//                 chai.expect(test.answers[j].text).to.not.be.null;
//                 chai.expect(test.answers[j].id).to.not.be.null;
//             }
//         }
//     });
//     it('getRStest_SimpleAnswers. 1 complex question,  3 simple answers.', () => {
//         let test: any,
//             lowerBound = Config.Tasks.RS.segmentsCount[0],
//             upperBound = Config.Tasks.RS.segmentsCount[1],
//             answersCount = 3;
//         for (let i = 0; i < 100; ++i) {
//             test = tests.getRStest_SimpleAnswers(0);

//             chai.expect(test.question[0].graph.length).to.be.at.most(upperBound);
//             chai.expect(test.question[0].graph.length).to.be.at.least(lowerBound);

//             chai.expect(test.answers.length).to.be.equal(answersCount);
//             for (let j = 0; j < answersCount; ++j) {
//                 chai.expect(test.answers[j].id).to.not.be.null;
//                 chai.expect(test.answers[j].letter).to.not.be.equal('');
//                 chai.expect(test.answers[j].leftIndex).to.not.be.null;
//                 chai.expect(test.answers[j].rightIndex).to.not.be.null;
//                 chai.expect(test.answers[j].correctSign).to.oneOf([-1, 0, 1]);
//             }
//         }
//     });
//     it('getRStest_ComplexAnswers. 1 complex question,  6 complex answers.', () => {
//         let test: any,
//             lowerBound = Config.Tasks.RS.segmentsCount[0],
//             upperBound = Config.Tasks.RS.segmentsCount[1],
//             answersCount = 6;
//         for (let i = 0; i < 100; ++i) {
//             test = tests.getRStest_ComplexAnswers(0);

//             chai.expect(test.question[0].graph.length).to.be.at.most(upperBound);
//             chai.expect(test.question[0].graph.length).to.be.at.least(lowerBound);

//             chai.expect(test.answers.length).to.be.equal(answersCount);
//             for (let j = 0; j < answersCount; ++j) {
//                 chai.expect(test.answers[j].id).to.not.be.null;
//                 chai.expect(test.answers[j].letter).to.not.be.equal('');
//                 chai.expect(test.answers[j].leftIndex).to.not.be.null;
//                 chai.expect(test.answers[j].rightIndex).to.not.be.null;
//                 chai.expect(test.answers[j].correctSign).to.oneOf([-1, 0, 1]);
//             }
//         }
//     });
//     it('getS2Gtest. 4 unique correct IDs', () => {
//         let simpleTest: any,
//             complexTest: any,
//             simpleTestCorrectIDs: any,
//             complexTestCorrectIDs: any;
//         for (let i = 0; i < 100; ++i) {
//             simpleTest = tests.getS2Gtest_SimpleFunctions(i);
//             complexTest = tests.getS2Gtest_ComplexFunctions(i);
//             simpleTestCorrectIDs = Array<number>();
//             complexTestCorrectIDs = Array<number>();

//             for (let j = 0; j < Config.Tasks.S2G.answersCount; ++j) {

//                 for (let id of simpleTest.question[j].correctIDs)
//                     if (!simpleTestCorrectIDs.contains(id))
//                         simpleTestCorrectIDs.push(id);

//                 for (let id of complexTest.question[j].correctIDs)
//                     if (!complexTestCorrectIDs.contains(id))
//                         complexTestCorrectIDs.push(id);
//             }
//             chai.expect(simpleTestCorrectIDs.length).to.be.equal(4);
//             chai.expect(complexTestCorrectIDs.length).to.be.equal(4);
//         }
//     })
// });