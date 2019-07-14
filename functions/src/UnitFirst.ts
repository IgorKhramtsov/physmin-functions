import { FunctionObj } from './FunctionObj'
import { Config } from "./Config";
import { Utils } from "./Util";

export class UnitFirst {

  static getG2Gtest(test_id: number, correctAnswersCount: number) {
    const count = Config.answerCount,
      answers = Array<any>(),
      usedFunctions = Array<FunctionObj>(),
      availableAxises = Config.axisIndexes.copy();
    let questionFunction: FunctionObj,
      testType: String,
      question: any;

    questionFunction = new FunctionObj().makeQuestionFunction();

    question = {
      graph: [questionFunction],
      correctIDs: Array<number>()
    };

    for (let i = 0; i < correctAnswersCount; i++) {
      question.correctIDs.addRandomNumber(count);
      usedFunctions.push(questionFunction.getCorrectFunction(usedFunctions));

      availableAxises.deleteItem(usedFunctions.last().funcType);
      answers.push({
        graph: [usedFunctions.last()],
        id: question.correctIDs[i]
      });
    }

    for (let i = 0; i < count; i++)
      if (!question.correctIDs.contains(i)) {
        usedFunctions.push(questionFunction.getIncorrectFunction(usedFunctions));
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

  static getG2Stest(test_id: number, chance: number) {
    const testType = "graph2state",
      questions = Array<any>(),
      answers = Array<any>(),

      answerCount = Config.answerCount,
      questionCount = Config.G2S_questionCount,

      correctIDs = Array<number>(),
      usedFunctions = Array<any>(),
      availableAxises = Config.axisIndexes.copy().deleteItem("a");

    let _chance: boolean,
      _funcLength: number;

    for (let i = 0; i < questionCount; ++i) {
      _chance = Utils.withChance(chance);
      correctIDs.addRandomNumber(questionCount);

      usedFunctions[i] = { questions: Array<FunctionObj>(), functions: Array<FunctionObj>() };
      usedFunctions[i].questions.push(new FunctionObj().makeQuestionFunction(usedFunctions[i].questions));

      if (_chance) _funcLength = Config.defaultLength / 2;
      else _funcLength = Config.defaultLength;

      usedFunctions[i].functions.push(usedFunctions[i].questions.last().
        getCorrectFunction(usedFunctions[i].functions, _funcLength, availableAxises));
      questions[i] = {
        id: i,
        graph: [usedFunctions[i].functions.last()],
        correctIDs: [correctIDs.last()],
      };

      if (_chance)
        questions[i].graph.push(usedFunctions[i].functions.last().
          createNextFunction(usedFunctions[i].functions, Config.defaultLength / 2));

    }

    let first: any,
      second: any,
      text = "";
    for (let i = 0; i < answerCount; ++i) {
      _chance = Utils.withChance(chance);
      if (_chance) _funcLength = Config.defaultLength / 2;
      else _funcLength = Config.defaultLength;

      if (correctIDs.contains(i)) { // Skip if its correct answer
        first = questions[i].graph[0];
        if (questions[i].graph.length === 2) second = questions[i].graph[1];
      } else {

        if (Utils.withChance(0.5)) { // Create brand new function with 0.5 chance
          first = usedFunctions.getRandom().questions.last().getIncorrectFunction(undefined, _funcLength,availableAxises);
          if (_chance)
            second = first.createNextFunction([first], Config.defaultLength / 2);
        } else { // Change second function of graph else
          const usedFunctionsRandommed = usedFunctions.getRandom().functions;
          first = usedFunctionsRandommed[0];
          if (_chance)
            second = usedFunctionsRandommed[0].createNextFunction([usedFunctionsRandommed], Config.defaultLength / 2);
        }
      }

      text = first.getTextDescription(true);
      if (second) {
        let firstText = first.getTextDescription(false),
          secondText = second.getTextDescription(false);
        if (firstText === secondText)
          text = "Все время " + firstText;
        else text = "Cперва " + firstText + ", затем " + secondText;
      }

      answers[i] = {
        text: text,
        id: i
      };
    }
    for (let i = 0; i < questions.length; ++i)
      for (let j = 0; j < answers.length; ++j)
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

  static getSGtest(test_id: number, isSimple: boolean) {
    const testType = "relationSings",
      answers = Array<any>(),

      questionCount = Math.round(Utils.getRandomFromBound("questionCount")),
      questionInterval = Math.round(Config.defaultLength / questionCount),

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
          makeQuestionFunction(undefined, (funcPoints[i + 1] - funcPoints[i]) ,availableAxises).
          getCorrectFunction(undefined, (funcPoints[i + 1] - funcPoints[i]), availableAxises));
        continue;
      }

      funcLength = funcPoints[i + 1] - funcPoints[i];
      usedFunctions[i] = usedFunctions[i - 1].createNextFunction([usedFunctions[i - 1]], funcLength);

      if (i === questionCount - 1)
        usedFunctions[i].params.len = 12 - funcPoints[i];
    }
    usedFunctions.last().snapToGrid();


    questions = usedFunctions.copy();
    const questionsCopy: Array<FunctionObj> = questions.copy(),
      answersCount = isSimple ? 3 : 6;

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
    for (let i = 0; i < answersCount; ++i) {
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

  static getG2Gtest_OneAnswerGraph(test_id: number) {
    return UnitFirst.getG2Gtest(test_id, 1);
  }

  static getG2Gtest_TwoAnswerGraph(test_id: number) {
    return UnitFirst.getG2Gtest(test_id, 2);
  }

  static getG2Stest_SimpleFunctions(test_id: number) {
    return UnitFirst.getG2Stest(test_id, 0);
  }

  static getG2Stest_ComplexFunctions(test_id: number) {
    return UnitFirst.getG2Stest(test_id, 1);
  }

  static getG2Stest_MixedFunctions(test_id: number, ComplexChance: number) {
    return UnitFirst.getG2Stest(test_id, ComplexChance);
  }

  static getSGtest_SimpleAnswers(test_id: number = 9) {
    return UnitFirst.getSGtest(test_id, true);
  }
  static getSGtest_ComplexAnswers(test_id: number) {
    return UnitFirst.getSGtest(test_id, false);
  }
}
