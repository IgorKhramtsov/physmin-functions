import * as functions from 'firebase-functions';
import FunctionObj from './FunctionObj'

// TODO: move function to class methods
// TODO: create 'chance' function


function getG2Gtest(test_id: number, answerCount: number) {
    let test = {
        type: "graph2graph",
        test_id: test_id,
        title: "",
        question: {} as any,
        answers: Array<any>()
    } as any;
    let count = 6,
        question = test.question,
        answers = test.answers;

    question.graph = new FunctionObj("", {}).makeQuestionFunction();
    question.correctID = Array<any>();
    if (answerCount == 1) {
        let correctID = count.getRandom();

        question.correctID[0] = correctID;
        answers[correctID] = {
            graph: question.graph.getCorrectFunction(),
            id: correctID
        };
        for (let i = 0; i < count; i++) {
            if (i == correctID)
                continue;
            answers[i] = {
                graph: question.graph.getIncorrectFunction(answers),
                id: i
            };
        }
    } else {
        test.type = "graph2graph2";
        question.correctID[0] = count.getRandom();
        //Should be reworked for next types of tests/quiz
        do question.correctID[1] = count.getRandom();
        while (question.correctID[1] == question.correctID[0]);

        answers[question.correctID[0]] = {
            graph: question.graph.getCorrectFunction(),
            id: question.correctID[0]
        };
        answers[question.correctID[1]] = {
            graph: question.graph.getCorrectFunction(answers[question.correctID[0]].graph),
            id: question.correctID[1]
        };
        for (let i = 0; i < count; i++) {
            if (question.correctID.indexOf(i) != -1)
                continue;
            answers[i] = {
                graph: question.graph.getIncorrectFunction(answers),
                id: i
            };
        }
    }
    return test;
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
//         test.question[i].correctID = correctIDs[i];
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


