import * as functions from 'firebase-functions';
import FunctionObj from './FunctionObj'
import {Config} from "./Config";
import {Utils} from "./Util";

export function getG2Gtest(test_id: number, correctAnswersCount: number) {
    let count = 6,
        question: any,
        answers = Array<any>(),
        testType: String,
        usedFunctions = Array<FunctionObj>(),
        questionFunction: FunctionObj;
    let availableAxises = Config.axisIndexes.slice();

    questionFunction = new FunctionObj().makeQuestionFunction(availableAxises);
    question = {
        graph: [questionFunction],
        correctIDs: Array<number>()
    };

    for (let i = 0; i < correctAnswersCount; i++) {
        question.correctIDs.addRandomNumber(count);
        usedFunctions.push(questionFunction.getCorrectFunction(availableAxises, usedFunctions));
        availableAxises.deleteItem(usedFunctions.last().funcType);
        answers[question.correctIDs[i]] = {
            graph: [usedFunctions.last()],
            id: question.correctIDs[i]
        }
    }
    for (let i = 0; i < count; i++)
        if (!question.correctIDs.contains(i)) {
            usedFunctions.push(questionFunction.getIncorrectFunction(Config.axisIndexes.slice(), usedFunctions));
            answers[i] = {
                graph: [usedFunctions.last()],
                id: i
            };
        }

    testType = correctAnswersCount == 1 ? "graph2graph" : "graph2graph2";

    return {
        type: testType,
        test_id: test_id,
        title: "",
        question: question,
        answers: answers
    };
}

export function getG2Stest(test_id: number, chance: number) {
    let testType = "graph2state",
        questions = Array<any>(),
        answers = Array<any>(),

        answerCount = 6,
        questionCount = 4,

        correctIDs = Array<number>(),
        usedFunctions = Array<any>(),
        availableAxises = Config.axisIndexes.slice().deleteItem("a");
    for (let i = 0; i < questionCount; i++) {
        correctIDs.addRandomNumber(questionCount);
        usedFunctions[i] = {questions: Array<FunctionObj>(), functions: Array<FunctionObj>()};

        usedFunctions[i].questions.push(new FunctionObj().makeQuestionFunction(availableAxises, usedFunctions[i].questions));
        usedFunctions[i].functions.push(usedFunctions[i].questions.last().getCorrectFunction(availableAxises, usedFunctions[i].functions));

        questions[i] = {
            graph: [usedFunctions[i].functions.last()],
            correctIDs: [correctIDs.last()],
        };

        if (Utils.withChance(chance))
            questions[i].graph.push(usedFunctions[i].functions.last().createNextFunction([usedFunctions[i]]));

    }

    let first: any,
        second: any,
        text = "";
    for (let i = 0; i < answerCount; i++) {
        if (correctIDs.contains(i)) { // Skip if its correct answer
            first = questions[i].graph[0];
            if (questions[i].graph.length == 2) second = questions[i].graph[1];
        } else {
            if (Utils.withChance(0.5)) { // Create brand new function with 0.5 chance
                first = usedFunctions.getRandom().questions.last().getIncorrectFunction(availableAxises);
                if (Utils.withChance(chance)) second = first.createNextFunction([first]);
            } else { // Change second function of graph else
                let functions = usedFunctions.getRandom().functions;
                first = functions[0];
                if (Utils.withChance(chance)) second = functions[0].createNextFunction([functions]);
            }
        }

        text = first.getText(true);
        if (second)
            text = "Cперва " + first.getText(false) + ", затем " + second.getText(false);
        answers[i] = {
            text: text,
            id: i
        };
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

export function getG2Gtest_OneAnswerGraph(test_id: number) {
    return getG2Gtest(test_id, 1);
}

export function getG2Gtest_TwoAnswerGraph(test_id: number) {
    return getG2Gtest(test_id, 2);
}

export function getG2Stest_SimpleFunctions(test_id: number) {
    return getG2Stest(test_id, 0);
}

export function getG2Stest_ComplexFunctions(test_id: number) {
    return getG2Stest(test_id, 1);
}

export function getG2Stest_MixedFunctions(test_id: number, ComplexChance: number) {
    return getG2Stest(test_id, ComplexChance);
}

// function getSGtest(test_id: number, chance: number, isSimple: boolean) {
//     let testType = "",
//         questions = Array<any>(),
//         answers = Array<any>(),
//
//         questionCount = Utils.getRandomFromBound("t"),
//         answersCount = 6,
//
//         correctIDs = Array<number>(),
//         questionFunctions = Array<any>(),
//         usedFunctions = Array<any>(),
//         availableAxises = Config.axisIndexes.slice();
//
//     //simple answersCount = 3, letter = funcTupe
//     //complicated answerCount = 6, letter = s, dx
//
//     let prevFunc: any;
//     for (let i = 0; i < questionCount; i++) {
//         if(!prevFunc)
//             prevFunc = new FunctionObj().makeQuestionFunction().getCorrectFunction(availableAxises);
//
//         usedFunctions[i] = prevFunc.createNextFunction();
//         correctIDs.addRandomNumber(questionCount);
//         prevFunc = usedFunctions[i];
//
//         questions[i] = {
//             graph: [usedFunctions[i]],
//             correctIDs: [correctIDs.last()],
//         };
//
//     }
//
//     answersCount = isSimple ? 3 : 6;
//     if(isSimple)
//         for (let i = 0; i < answersCount; i++) {
//             answers[i] = {
//                 letter: questions[i].graph[0].funcType,
//                 leftIndex: "",
//                 rightIndex: "",
//                 correctSign: 0,
//             }
//         }
//     else
//
//
//     return {
//         type: testType,
//         test_id: test_id,
//         title: "",
//         question: questions,
//         answers: answers,
//     };
// }

exports.getTest = functions.region("europe-west1").https.onRequest((request, resp) => {
//exports.getTest = functions.region("europe-west1").https.onCall((data, context) => {

    let testQuiz = {tests: Array<any>()};

    testQuiz.tests.push(getG2Gtest_OneAnswerGraph(0));

    testQuiz.tests.push(getG2Gtest_TwoAnswerGraph(2));

    testQuiz.tests.push(getG2Stest(4, 1));

    resp.send(JSON.stringify(testQuiz));
    //return JSON.stringify(testQuiz)
});
