import * as functions from 'firebase-functions';
import FunctionObj from './FunctionObj'

function getG2Gtest(test_id: number, correctAnswersCount: number) {
    let count = 6,
        question: any,
        answers = Array<any>(),
        testType: String,
        usedFunctions = Array<any>();

    question = {
        graph: new FunctionObj().makeQuestionFunction(),
        correctIDs: Array<any>()
    };

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

    if (correctAnswersCount == 1) testType = "graph2graph";
    else testType = "graph2graph2";

    return {
        type: testType,
        test_id: test_id,
        title: "",
        question: question,
        answers: answers
    };
}

function getG2Stest(test_id: number) {
    let testType = "graph2state",
        question = Array<any>(),
        answers = Array<any>(),

        answerCount = 6,
        questionCount = 4,

        correctIDs = Array<number>(),
        usedFunctions = Array<any>();

    for (let i = 0; i < questionCount; i++) {
        correctIDs.addRandomNumber(questionCount);
        usedFunctions[i] = new FunctionObj().makeQuestionFunction();
        question[i] = {
            graph: usedFunctions[i].getCorrectFunction(usedFunctions),
            correctIDs: [correctIDs.last()],
        };
    }
    for (let i = 0; i < answerCount; i++) {
        if (correctIDs.contains(i))
            answers[i] = {
                text: question[i].graph.getText(),
                id: i
            };
        else
            answers[i] = {
                text: usedFunctions.getRandom().getIncorrectFunction().getText(),
                id: i
            };

    }
    return {
        type: testType,
        test_id: test_id,
        title: "",
        question: question,
        answers: answers
    };
}



// exports.getTest = functions.region("europe-west1").https.onRequest((request, resp) => {
exports.getTest = functions.region("europe-west1").https.onCall((data, context) => {

    let testQuiz = {tests: Array<any>()};

    testQuiz.tests.push(getG2Gtest(0, 1));
    testQuiz.tests.push(getG2Gtest(1, 1));

    testQuiz.tests.push(getG2Gtest(2, 2));
    testQuiz.tests.push(getG2Gtest(3, 2));

    testQuiz.tests.push(getG2Stest(4));
    testQuiz.tests.push(getG2Stest(5));

    // resp.send( JSON.stringify(testQuiz));
    return JSON.stringify(testQuiz)
});


