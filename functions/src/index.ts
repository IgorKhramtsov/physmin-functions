import * as functions from 'firebase-functions';
import FunctionObj from './FunctionObj'

function getG2Gtest(test_id: number, correctAnswersCount: number) {
    let count = 6,
        question: any,
        answers = Array<any>(),
        testType: String,
        usedFunctions: Array<any>;

    question = {
        graph: new FunctionObj().makeQuestionFunction(),
        correctIDs: Array<any>()
    };
    usedFunctions = Array<any>();
    for (let i = 0; i < correctAnswersCount; i++) {
        question.correctIDs.addRandomNumber(count);
        usedFunctions.push(question.graph.getCorrectFunction(usedFunctions));
        answers[question.correctIDs[i]] = {
            graph: usedFunctions[i],
            id: question.correctIDs[i]
        }
    }
    for (let i = 0; i < count; i++)
        if (question.correctIDs.indexOf(i) == -1) {
            usedFunctions.push(question.graph.getIncorrectFunction(usedFunctions));
            answers[i] = {
                graph: usedFunctions.last(),
                id: i
            };
        }
    if (correctAnswersCount == 1)
        testType = "graph2graph";
    else
        testType = "graph2graph2";

    return {
        type: testType,
        test_id: test_id,
        title: "",
        question: question,
        answers: answers
    };
}

// function getG2Stest(test_id: number) {
//     let test = {
//         type: "graph2state",
//         test_id: test_id,
//         title: "",
//         question: [{}],
//         answers: Array<Object>()
//     } as any;
//     let answerCount = 6,
//         questionCount = 4;
//
//     let correctIDs = [];
//     for (let i = 0; i < questionCount; i++) {
//         do correctIDs[i] = questionCount.getRandom();
//         while (correctIDs.indexOf(correctIDs[i]) == 1);
//         test.question[i] = getQuestionFunction(test.question);
//         test.question[i].correctIDs = correctIDs[i];
//     }
//     for (let i = 0; i < answerCount; i++) {
//         if (correctIDs.indexOf(i) == 1)
//             test.answers[correctIDs[i]] = getCorrectFunction(test.question);
//         else test.answers[correctIDs[i]] = getIncorrectFunction(test.question);
//     }
// }
//
// function getCorrectText() {
//
// }

// exports.getTest = functions.region("europe-west1").https.onRequest((request, resp) => {
exports.getTest = functions.region("europe-west1").https.onCall((data, context) => {

    let testQuiz = {tests: Array<any>()};

    testQuiz.tests[0] = getG2Gtest(0, 1);
    testQuiz.tests[1] = getG2Gtest(1, 1);
    testQuiz.tests[2] = getG2Gtest(2, 1);
    testQuiz.tests[3] = getG2Gtest(3, 1);

    testQuiz.tests[4] = getG2Gtest(4, 2);
    testQuiz.tests[5] = getG2Gtest(5, 2);
    testQuiz.tests[6] = getG2Gtest(6, 2);
    testQuiz.tests[7] = getG2Gtest(7, 2);

    // resp.send( JSON.stringify(quiz));
    return JSON.stringify(testQuiz)
});


