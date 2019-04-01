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
    let availableAxises = Config.axisIndexes.copy();

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
            usedFunctions.push(questionFunction.getIncorrectFunction(Config.axisIndexes.copy(), usedFunctions));
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
        _chance: boolean,

        correctIDs = Array<number>(),
        usedFunctions = Array<any>(),
        availableAxises = Config.axisIndexes.copy().deleteItem("a");

    for (let i = 0; i < questionCount; i++) {
        _chance = Utils.withChance(chance);
        correctIDs.addRandomNumber(questionCount);
        usedFunctions[i] = {questions: Array<FunctionObj>(), functions: Array<FunctionObj>()};

        usedFunctions[i].questions.push(new FunctionObj().makeQuestionFunction(availableAxises, usedFunctions[i].questions));
        usedFunctions[i].functions.push(usedFunctions[i].questions.last().getCorrectFunction(availableAxises, usedFunctions[i].functions));

        questions[i] = {
            graph: [usedFunctions[i].functions.last()],
            correctIDs: [correctIDs.last()],
        };

        if (_chance)
            questions[i].graph.push(usedFunctions[i].functions.last().createNextFunction([usedFunctions[i]]));

    }

    let first: any,
        second: any,
        text = "";
    for (let i = 0; i < answerCount; i++) {
        _chance = Utils.withChance(chance);

        if (correctIDs.contains(i)) { // Skip if its correct answer
            first = questions[i].graph[0];
            if (questions[i].graph.length == 2) second = questions[i].graph[1];
        } else {

            if (Utils.withChance(0.5)) { // Create brand new function with 0.5 chance
                first = usedFunctions.getRandom().questions.last().getIncorrectFunction(availableAxises);
                if (_chance) second = first.createNextFunction([first]);
            } else { // Change second function of graph else
                let usedFunctionsRandommed = usedFunctions.getRandom().functions;
                first = usedFunctionsRandommed[0];
                if (_chance) second = usedFunctionsRandommed[0].createNextFunction([usedFunctionsRandommed]);
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

function getSGtest(test_id: number, isSimple: boolean) {
    let testType = "relationSings",
        questions = Array<any>(),
        answers = Array<any>(),

        questionCount = Math.round(Utils.getRandomFromBound("t")),
        answersCount = 0,

        usedFunctions = Array<any>(),
        availableAxises = Config.axisIndexes.copy();

    //simple answersCount = 3, letter = funcType
    //complicated answerCount = 6, letter = s, dx

    let prevFunc: any;
    for (let i = 0; i < questionCount; i++) {
        if (!prevFunc)
            prevFunc = new FunctionObj().makeQuestionFunction(availableAxises)
                .getCorrectFunction(availableAxises);

        usedFunctions[i] = prevFunc.createNextFunction([prevFunc]);
        prevFunc = usedFunctions[i];

        questions.push(usedFunctions[i]);
    }

    let questionsCopy = usedFunctions.copy(),
        question: any,
        t: any,
        prevT: any,
        leftIndex,
        rightIndex;
    let zeroFunc = new FunctionObj(questionsCopy[0].funcType, questionsCopy[0].params);
        zeroFunc.params.t = 0;
        questionsCopy.splice(0, 0, zeroFunc);
    if (isSimple) {
        answersCount = 3;
        for (let i = 0; i < answersCount; i++) {
            do question = questionsCopy.getRandom();
            while (question === undefined ||
                    questionsCopy.indexOf(question) == 0);

            rightIndex = questionsCopy.indexOf(question);
            do leftIndex = rightIndex.getRandom();
            while (leftIndex == rightIndex ||
                    questionsCopy[leftIndex] === undefined);

            prevT = questionsCopy[leftIndex].params.t;
            t = question.params.t ? question.params.t : 12;

            answers[i] = {
                id: i,
                letter: question.funcType,
                leftIndex: leftIndex,
                rightIndex: rightIndex+1,
                correctSign: Math.sign(question.calculateFunctionValue(t) - question.calculateFunctionValue(prevT)),
            };
            delete questionsCopy[rightIndex];
        }
    }
    else {
        let letters = Config.letters.copy(),
            CopyForS = questionsCopy.copy(),
            CopyForDX = questionsCopy.copy(),
            letter: any;
        answersCount = 6;
        for (let i = 0; i < answersCount; i++) {
            letter = letters.getRandom();
            questionsCopy = letter == "S" ? CopyForS : CopyForDX;

            do question = questionsCopy.getRandom();
            while (question === undefined ||
                    questionsCopy.indexOf(question) == 0);

            rightIndex = questionsCopy.indexOf(question);
            do leftIndex = rightIndex.getRandom();
            while (leftIndex == rightIndex ||
                    questionsCopy[leftIndex] === undefined);

            prevT = questionsCopy[leftIndex].params.t;
            t = question.params.t ? question.params.t : 12;

            answers[i] = {
                id: i,
                letter: letter,
                leftIndex: leftIndex,
                rightIndex: rightIndex + 1,
                correctSign: Math.sign(question.calcFuncValueFromRange(prevT, t, letter)),
            };
            letters.deleteItem(letter);
            delete questionsCopy[rightIndex];
        }
    }


    return {
        type: testType,
        test_id: test_id,
        title: "",
        question: [{graph: questions}],
        answers: answers,
    };
}

//exports.getTest = functions.region("europe-west1").https.onRequest((request, resp) => {
exports.getTest = functions.region("europe-west1").https.onCall((data, context) => {

    let testQuiz = {tests: Array<any>()};

    // testQuiz.tests.push(getG2Gtest_OneAnswerGraph(0));
    //
    // testQuiz.tests.push(getG2Gtest_TwoAnswerGraph(1));
    //
    // testQuiz.tests.push(getG2Stest_SimpleFunctions(2));
    // testQuiz.tests.push(getG2Stest_ComplexFunctions(3));
    // testQuiz.tests.push(getG2Stest_MixedFunctions(4, 0.5));

    testQuiz.tests.push(getSGtest(6, false));
    testQuiz.tests.push(getSGtest(7, false));
    testQuiz.tests.push(getSGtest(8, false));
    // testQuiz.tests.push(getSGtest(8, false));

     //resp.send(JSON.stringify(testQuiz));
    return JSON.stringify(testQuiz)
});
