import * as functions from 'firebase-functions';
import FunctionObj from './FunctionObj'
import {Config} from "./Config";
import {Utils} from "./Util";

function getG2Gtest(test_id: number, correctAnswersCount: number) {
    let count = 6,
        question: any,
        answers = Array<any>(),
        testType: String,
        usedFunctions = Array<any>();

    question = {
        graph: [new FunctionObj().makeQuestionFunction()],
        correctIDs: Array<any>()
    };

    let availableAxises = Config.axisIndexes.slice();
    for (let i = 0; i < correctAnswersCount; i++) {
        question.correctIDs.addRandomNumber(count);
        usedFunctions.push(question.graph[0].getCorrectFunction(availableAxises, usedFunctions));
        availableAxises.deleteItem(usedFunctions.last().funcType);
        answers[question.correctIDs[i]] = {
            graph: [usedFunctions[i]],
            id: question.correctIDs[i]
        }
    }
    for (let i = 0; i < count; i++)
        if (!question.correctIDs.contains(i)) {
            usedFunctions.push(question.graph[0].getIncorrectFunction(usedFunctions));
            answers[i] = {
                graph: [usedFunctions.last()],
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

function getG2Stest(test_id: number, chance: number) {
    let testType = "graph2state",
        questions = Array<any>(),
        answers = Array<any>(),

        answerCount = 6,
        questionCount = 4,

        correctIDs = Array<number>(),
        questionFunctions = Array<any>(),
        usedFunctions = Array<any>(),
        availableAxises = Config.axisIndexes.slice();

    for (let i = 0; i < questionCount; i++) {
        correctIDs.addRandomNumber(questionCount);
        questionFunctions[i] = new FunctionObj().makeQuestionFunction();
        usedFunctions[i] = questionFunctions[i].getCorrectFunction(availableAxises, usedFunctions);

        questions[i] = {
            graph: [usedFunctions[i]],
            correctIDs: [correctIDs.last()],
        };

        if (Utils.withChance(chance))
            questions[i].graph.push(usedFunctions[i].createNextFunction());
    }
    for (let i = 0; i < answerCount; i++) {
        if (correctIDs.contains(i))
            answers[i] = {
                text: usedFunctions[i].getText(),
                id: i
            };
        else {
            let first: any,
                second: any,
                index: number;

            if (Utils.withChance(0.5)) {
                first = questionFunctions.getRandom().getIncorrectFunction();
                if (Utils.withChance(chance))
                    second = first.createNextFunction();
            }

            else {
                first = usedFunctions.getRandom();
                index = usedFunctions.indexOf(first);
                if (questions[index].graph.length == 2)
                    if (Utils.withChance(chance))
                        second = first.createNextFunction([questions[index].graph.last()]);
            }

            let text = "Cперва " + first.getText();
            if (second)
                text += ", затем " + second.getText();

            answers[i] = {
                text: text,
                id: i
            };
        }

    }
    for (let i = 0; i < questions.length; i++)
        for (let j = 0; j < answers.length; j++)
            if (answers[j].id != questions[i].correctIDs[0])
                if (answers[j].text == answers[questions[i].correctIDs[0]].text)
                    questions[i].correctIDs.push(j);

    return {
        type: testType,
        test_id: test_id,
        title: "",
        question: questions,
        answers: answers
    };
}


exports.getTest = functions.region("europe-west1").https.onRequest((request, resp) => {
// exports.getTest = functions.region("europe-west1").https.onCall((data, context) => {

    let testQuiz = {tests: Array<any>()};

    testQuiz.tests.push(getG2Gtest(0, 1));
    testQuiz.tests.push(getG2Gtest(1, 1));

    testQuiz.tests.push(getG2Gtest(2, 2));
    testQuiz.tests.push(getG2Gtest(3, 2));

    testQuiz.tests.push(getG2Stest(4));
    testQuiz.tests.push(getG2Stest(5));

    testQuiz.tests.push(getG2Stest(6));
    testQuiz.tests.push(getG2Stest(7));
    resp.send(JSON.stringify(testQuiz));
    // return JSON.stringify(testQuiz)
});


