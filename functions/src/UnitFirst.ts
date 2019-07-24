import { FunctionObj } from './FunctionObj'
import { Config } from "./Config";
import { Utils } from "./Util";

//// Explanation for Dima, boy: add property for availableAxises. To generate certain functions, like
//// builder = new FunctionBuilder()
//// builder.getQuestionFunction()
//// builder.setAvailableAxieses("x")
//// builder.getCorrectFunction()
//// builder.setAvailableAxieses("v")
//// builder.getIncorrectFunction()

class FunctionBuilder {
  // --------------------------------------------
  // ARRAYS
  // --------------------------------------------
  private usedQuestionFuncs: Array<any>;
  private usedCorrectFuncs: Array<FunctionObj>;
  private usedIncorrectFuncs: Array<FunctionObj>;
  // --------------------------------------------
  // OPTIONS
  // --------------------------------------------
  private isSnapping: boolean;
  private functionLength: number;
  private availableAxises: Array<string>;

  constructor() {
    this.usedQuestionFuncs = Array<any>();
    this.usedCorrectFuncs = Array<FunctionObj>();
    this.usedIncorrectFuncs = Array<FunctionObj>();

    this.isSnapping = false;
    this.functionLength = Config.defaultLength;
    this.availableAxises = Config.axisIndexes;
  }


  // --------------------------------------------
  // OPTIONS FUNCTUINS
  // --------------------------------------------
  enableSnap() {
    this.isSnapping = true;
  }
  disableSnap() {
    this.isSnapping = false;
  }
  // ------------------------------
  reset() {
    FunctionBuilder.constructor();

    return this;
  }
  // ------------------------------
  setLength(length: number) {
    if (length < 0 || length > Config.defaultLength)
      throw Error('Parameter <functionLength> must be in [0,' + Config.defaultLength + '].')
    else if (length === 0)
      this.functionLength = Config.defaultLength;
    else
      this.functionLength = length;

    return this;
  }
  setAvailableAxieses(axises: Array<string>) {
    if(axises.length <= 0)
      throw Error("Available axises array cant be empty!");

    this.availableAxises = axises.copy();
  }
  /** Return copy of available axises */
  getAvailableAxises() {
    return this.availableAxises.copy();
  }
  // --------------------------------------------
  // API FUNCTIONS
  // --------------------------------------------
  getQuestionFunction() {
    let questionFunc = this.createQuestionFunction();
    this.usedQuestionFuncs.push(questionFunc);

    return questionFunc;
  }

  getCorrectFunction() {
    let correctFunction = this.createCorrectFunction();
    this.usedCorrectFuncs.push(correctFunction);

    return correctFunction;
  }

  getIncorrectFunction() {
    let incorrectFunction = this.createIncorrectFunction();
    this.usedIncorrectFuncs.push(incorrectFunction);

    return incorrectFunction;
  }

  // --------------------------------------------
  // PRIVATE FUNCTIONS
  // --------------------------------------------
  private createQuestionFunction(): Object {
    // TODO: make recursive exception
    let question = {
      func: new FunctionObj(this.availableAxises.getRandom())
        .generateParams()
        .clearParams(),
      axises: this.getAvailableAxises()
    };

    if (this.usedQuestionFuncs.length !== 0)
      for (const usedQuestion of this.usedQuestionFuncs)
        if (question.func.equalTo(usedQuestion.func))
          return this.createQuestionFunction();

    question.func.params.len = this.functionLength;
    if(this.isSnapping)
      question.func = question.func.snapToGrid()

    return question;
  }
  // ---------------------------------------------------------------------------------
  private createCorrectFunction(): FunctionObj {
    let question: any;

    if(this.usedQuestionFuncs.length === 0)
      throw Error("There are none of question function");

    // Dont need to iterate through all question funcs
    // for(question of this.usedQuestionFuncs)
    //   if(question.axises.length > 0)
    //     break;

    if (question.axises.length === 0)
      throw Error('There are none of available axises left.');

    const pickedAxis = question.axises.getRandom(),
      newParams = question.func.copyParams(),
      correctFunction = new FunctionObj(pickedAxis, newParams).makeCorrectParams().clearParams();

    question.axises.deleteItem(pickedAxis);
    correctFunction.params.len = this.functionLength;
    return this.isSnapping ? correctFunction.snapToGrid() : correctFunction;
  }
  // ---------------------------------------------------------------------------------
  private createIncorrectFunction(): FunctionObj {
    // Doesnt matter from which question we make an incorrect. It can be absolutely random.
    // Only one rule is that must be not correct to any existing questions.
    // The same for axises. Doesnt matter which axieses was used in createCorrectFunction and available in question object.
    // Suka, tak shrift nravitsa, pizdec. Gotov zdes rep pisat.

    if (this.usedQuestionFuncs.length === 0)
      throw Error("There are none of question function");

    const question = this.usedQuestionFuncs.getRandom();

    const pickedAxis = this.availableAxises.getRandom(),
      newParams = question.func.copyParams(),
      incorrectFunction = new FunctionObj(pickedAxis, newParams).makeIncorrectParams().clearParams();

    // TODO: Need to check is this func incorrect to every question function
    if (this.usedIncorrectFuncs)
      for (const func of this.usedIncorrectFuncs)
        if (incorrectFunction.equalTo(func))
          return this.createIncorrectFunction();

    incorrectFunction.params.len = this.functionLength;
    return this.isSnapping ? incorrectFunction.snapToGrid() : incorrectFunction;
  }
  // ---------------------------------------------------------------------------------

}

export class UnitFirst {

  // Check it. Most likely its right.
  static getG2Gtest_by_builder(test_id: number, correctAnswersCount: number) {
    const count = Config.answerCount,
      answers = Array<any>(),
      builder = new FunctionBuilder();

    let question = {
      graph: builder.getQuestionFunction(),
      correctIDs: Array<Number>()
    };

    for (let i = 0; i < correctAnswersCount; ++i)
      answers.push({
        graph: builder.getCorrectFunction(),
        id: question.correctIDs.addRandomNumber(count)
      })

    for(let i = 0; i < count; ++i)
      if(!question.correctIDs.contains(i))
        answers.push({
          graph: builder.getIncorrectFunction(),
          id: i
        })

    return {
      type: correctAnswersCount === 1 ? "graph2graph" : "graph2graph2",
      test_id: test_id,
      question: question,
      answers: answers.shuffle()
    };
  }

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

      // availableAxises.deleteItem(usedFunctions.last().funcType);
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
    answers.shuffle(); // is this correct? Because it return shuffled array, but original array isnt changes
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
          first = usedFunctions.getRandom().questions.last().getIncorrectFunction(undefined, _funcLength, availableAxises);
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
          makeQuestionFunction(undefined, (funcPoints[i + 1] - funcPoints[i]), availableAxises).
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
        letter = countS < (answersCount / 2) ? "S" : "Δ" + questionsCopy[0].funcType;
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
        leftIndexes: [indexes[count][0][0], (parseInt(indexes[count][0][1]) + 1)],
        rightIndexes: [indexes[count][1][0], (parseInt(indexes[count][1][1]) + 1)],
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
