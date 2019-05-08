import * as functions from 'firebase-functions';
import FunctionObj from './FunctionObj'
import { Config } from "./Config";
import { Utils } from "./Util";
import * as cors from 'cors';
const corsHandler = cors({ origin: true });

export function getG2Gtest(test_id: number, correctAnswersCount: number) {
  const count = 6,
    answers = Array<any>(),
    usedFunctions = Array<FunctionObj>(),
    availableAxises = Config.axisIndexes.copy();
  let questionFunction: FunctionObj,
    testType: String,
    question: any;

  questionFunction = new FunctionObj().makeQuestionFunction(availableAxises);
  questionFunction.params.len = Config.defaultLength;
  questionFunction.snapToGrid();
  question = {
    graph: [questionFunction],
    correctIDs: Array<number>()
  };

  for (let i = 0; i < correctAnswersCount; i++) {
    question.correctIDs.addRandomNumber(count);
    usedFunctions.push(questionFunction.getCorrectFunction(availableAxises, usedFunctions));
    usedFunctions.last().params.len = Config.defaultLength;
    usedFunctions.last().snapToGrid();
    availableAxises.deleteItem(usedFunctions.last().funcType);
    // answers[question.correctIDs[i]] = {
    answers.push({
      graph: [usedFunctions.last()],
      id: question.correctIDs[i]
    });
  }
  for (let i = 0; i < count; i++)
    if (!question.correctIDs.contains(i)) {
      usedFunctions.push(questionFunction.getIncorrectFunction(Config.axisIndexes.copy(), usedFunctions));
      usedFunctions.last().params.len = Config.defaultLength;
      usedFunctions.last().snapToGrid();
      answers.push({
        graph: [usedFunctions.last()],
        id: i
      });
    }

  testType = correctAnswersCount === 1 ? "graph2graph" : "graph2graph2";
  answers.arrayShuffle();
  return {
    type: testType,
    test_id: test_id,
    title: "",
    question: question,
    answers: answers
  };
}

export function getG2Stest(test_id: number, chance: number) {
  const testType = "graph2state",
    questions = Array<any>(),
    answers = Array<any>(),

    answerCount = 6,
    questionCount = 4,

    correctIDs = Array<number>(),
    usedFunctions = Array<any>(),
    availableAxises = Config.axisIndexes.copy().deleteItem("a");

  let _chance: boolean;

  for (let i = 0; i < questionCount; i++) {
    _chance = Utils.withChance(chance);

    correctIDs.addRandomNumber(questionCount);
    usedFunctions[i] = { questions: Array<FunctionObj>(), functions: Array<FunctionObj>() };

    usedFunctions[i].questions.push(new FunctionObj().makeQuestionFunction(availableAxises, usedFunctions[i].questions));

    usedFunctions[i].functions.push(usedFunctions[i].questions.last().getCorrectFunction(availableAxises, usedFunctions[i].functions));

    if (_chance) {
      usedFunctions[i].functions.last().params.len = Config.defaultLength / 2;
    } else usedFunctions[i].functions.last().params.len = Config.defaultLength;
    usedFunctions[i].functions.last().snapToGrid();

    questions[i] = {
      graph: [usedFunctions[i].functions.last()],
      correctIDs: [correctIDs.last()],
    };

    if (_chance) {
      questions[i].graph.push(usedFunctions[i].functions.last().createNextFunction(usedFunctions[i].functions, Config.defaultLength / 2));
    }

  }

  let first: any,
    second: any,
    text = "";
  for (let i = 0; i < answerCount; i++) {
    _chance = Utils.withChance(chance);

    if (correctIDs.contains(i)) { // Skip if its correct answer
      first = questions[i].graph[0];

      if (questions[i].graph.length === 2) {
        // first.params.len = 6;
        second = questions[i].graph[1];
      }

    } else {

      if (Utils.withChance(0.5)) { // Create brand new function with 0.5 chance
        first = usedFunctions.getRandom().questions.last().getIncorrectFunction(availableAxises);
        if (_chance) {
          first.params.len = Config.defaultLength / 2;
          second = first.createNextFunction([first], Config.defaultLength / 2);
          second.snapToGrid();
        } else {
          first.params.len = Config.defaultLength;
          first.snapToGrid();
        }

      } else { // Change second function of graph else
        const usedFunctionsRandommed = usedFunctions.getRandom().functions;
        first = usedFunctionsRandommed[0];

        if (_chance) {
          first.params.len = Config.defaultLength / 2;
          second = usedFunctionsRandommed[0].createNextFunction([usedFunctionsRandommed], Config.defaultLength / 2);
          second.snapToGrid();
        } else {
          first.params.len = Config.defaultLength;
          first.snapToGrid();
        }
      }
    }

    text = first.getTextDescription(true);
    if (second)
      text = "Cперва " + first.getTextDescription(false) + ", затем " + second.getTextDescription(false);
    answers[i] = {
      text: text,
      id: i
    };
  }
  for (let i = 0; i < questions.length; i++)
    for (let j = 0; j < answers.length; j++)
      if (answers[j].id !== questions[i].correctIDs[0])
        if (answers[j].text === answers[questions[i].correctIDs[0]].text)
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

export function getSGtest(test_id: number, isSimple: boolean) {
  const testType = "relationSings",
    answers = Array<any>(),

    questionCount = Math.round(Utils.getRandomFromBound("questionCount")),
    questionInterval = Math.round(12 / questionCount),

    usedFunctions = Array<any>(),
    availableAxises = Config.axisIndexes.copy().deleteItem("a");

  let questions = Array<any>(),
    funcPoints = Array<number>(),
    temp = 0,
    funcLength;
  funcPoints.push(0);
  for (let i = 0; i < questionCount - 1; i++) {
    temp += questionInterval;
    funcPoints.push(Math.round(Utils.getRandomFromRange(temp, temp)));
  }
  for (let i = 0; i < questionCount; i++) {
    if (i === 0) {
      usedFunctions.push(new FunctionObj().
        makeQuestionFunction(availableAxises).
        getCorrectFunction(availableAxises));
      usedFunctions[i].params.len = funcPoints[i + 1] - funcPoints[i];
      continue;
    }

    funcLength = funcPoints[i + 1] - funcPoints[i];
    usedFunctions[i] = usedFunctions[i - 1].createNextFunction([usedFunctions[i - 1]], funcLength);
    // usedFunctions[i - 1].snapToGrid();


    if (i === questionCount - 1)
      usedFunctions[i].params.len = 12 - funcPoints[i];
  }
  // usedFunctions.last().normilizeFunc();
  usedFunctions.last().snapToGrid();
  questions = usedFunctions.copy();
  const questionsCopy: Array<FunctionObj> = questions.copy(),
    answersCount = isSimple ? 3 : 6;


  // const zeroFunc = new FunctionObj(questionsCopy[0].funcType, questionsCopy[0].copyParams());
  // zeroFunc.params.len = 0;
  // questionsCopy.splice(0, 0, zeroFunc);
  let firstIndexes: any,
    secondIndexes: any,
    indexes: any,
    letter = "S";
  if (!isSimple) {
    firstIndexes = FunctionObj.getIndexes(questionCount, answersCount / 2);
    secondIndexes = FunctionObj.getIndexes(questionCount, answersCount / 2);
  } else firstIndexes = FunctionObj.getIndexes(questionCount, answersCount);

  let leftValue, rightValue,
    leftCouple, rightCouple,
    rightFunction, leftFunction,
    countS = 0, countDX = 0, count = 0;
  for (let i = 0; i < answersCount; i++) {
    if (!isSimple) {
      letter = countS < (answersCount / 2) ? "S" : "d" + questionsCopy[0].funcType;
      if (letter === "S") {
        indexes = firstIndexes;
        count = countS;
      } else {
        indexes = secondIndexes;
        count = countDX;
      }
    } else indexes = firstIndexes;

    leftCouple = {
      left: indexes[count][0][0],
      right: indexes[count][0][1],
    };
    rightCouple = {
      left: indexes[count][1][0],
      right: indexes[count][1][1],
    };
    if (!isSimple && letter != null) {
      if (letter == "S") {
        leftValue = FunctionObj.calcFuncValueFromRange(leftCouple.left, leftCouple.right, questionsCopy);
        rightValue = FunctionObj.calcFuncValueFromRange(rightCouple.left, rightCouple.right, questionsCopy);
      } else {
        leftFunction = questionsCopy[leftCouple.right];
        rightFunction = questionsCopy[rightCouple.right];

        leftValue = leftFunction.calculateFunctionValue(leftFunction.params.len);
        rightValue = rightFunction.calculateFunctionValue(rightFunction.params.len);
      }
    } else {
      leftFunction = questionsCopy[leftCouple.right];
      rightFunction = questionsCopy[rightCouple.right];

      leftValue = leftFunction.calculateFunctionValue(leftFunction.params.len);
      rightValue = rightFunction.calculateFunctionValue(rightFunction.params.len);
    }

    answers[i] = {
      id: i,
      letter: isSimple ? questionsCopy[0].funcType : letter,
      leftIndex: [indexes[count][0][0], (parseInt(indexes[count][0][1]) + 1)],
      rightIndex: [indexes[count][1][0], (parseInt(indexes[count][1][1]) + 1)],
      correctSign: Math.sign(leftValue - rightValue),
    };
    if (!isSimple) if (letter === "S") countS++; else countDX++;
    else count++;
  }
  return {
    type: testType,
    test_id: test_id,
    title: "",
    question: [{ graph: questions }],
    answers: answers,
  };
}
/*
* 1)Если две идущие подряд функции имеют одно направление и почти одинаковые V, то вторую V флипануть по
* знаку
* 2)Если значение функции в крайней точке интервала больше, чем верхний предел, то уменьшаем ее приращение,
* если значение функции в крайней точке интервала меньше, чем нижний предел, то увеличиваем ее приращение.
* 3)Если значение функции в начальной точке интервала больше или равно верхнему пределу, то меняем ее направление на
* противоположное.
* */
// exports.getTest = functions.region("europe-west1").https.onRequest((request, resp) => {
// // exports.getTest = functions.region("europe-west1").https.onCall((data, context) => {
//
//   const testQuiz = { tests: Array<any>() };
//
//   testQuiz.tests.push(getG2Gtest_OneAnswerGraph(0));
//   testQuiz.tests.push(getG2Gtest_TwoAnswerGraph(1));
//   testQuiz.tests.push(getG2Stest_SimpleFunctions(2));
//   testQuiz.tests.push(getG2Stest_ComplexFunctions(3));
//   testQuiz.tests.push(getG2Stest_MixedFunctions(4, 0.5));
//
//   // testQuiz.tests.push(getSGtest(6, true));
//   // testQuiz.tests.push(getSGtest(7, true));
//   // testQuiz.tests.push(getSGtest(8, false));
//
//   resp.send(JSON.stringify(testQuiz));
//
//   // return JSON.stringify(testQuiz)
// });

exports.getTestDev = functions.region("europe-west1").https.onRequest((request, resp) => {
  // exports.getTestDev = functions.region("europe-west1").https.onCall((data, context) => {
  const testQuiz = { tests: Array<any>() };

  //
  // testQuiz.tests.push(getG2Gtest_OneAnswerGraph(1));
  // testQuiz.tests.push(getG2Gtest_TwoAnswerGraph(2));

  // testQuiz.tests.push(getG2Stest_SimpleFunctions(2));
  testQuiz.tests.push(getG2Stest_ComplexFunctions(3));
  // testQuiz.tests.push(getG2Stest_MixedFunctions(4, 0.5));

  // testQuiz.tests.push(getSGtest(6, true));
  // testQuiz.tests.push(getSGtest(7, false));
  // testQuiz.tests.push(getSGtest(8, false));

  return corsHandler(request, resp, () => {
    resp.send(JSON.stringify(testQuiz));
  });
  // resp.send(JSON.stringify(testQuiz));
  // return JSON.stringify(testQuiz)
});
