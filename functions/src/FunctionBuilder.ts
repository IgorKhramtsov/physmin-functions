import { FunctionObj } from './FunctionObj'
import { Config } from "./Config";
import { Utils } from './Util';

export class FunctionBuilder {
  private usedQuestionFuncs: Array<any>;
  private usedCorrectFuncs: Array<FunctionObj>;
  private usedIncorrectFuncs: Array<FunctionObj>;

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
  // -----------------------------------------------------------------------------
  enableSnap() {
    this.isSnapping = true;
  }
  disableSnap() {
    this.isSnapping = false;
  }

  reset() {
    FunctionBuilder.constructor();

    return this;
  }

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
    if (axises.length <= 0)
      throw Error("Available axises array cant be empty!");

    this.availableAxises = axises.copy();
  }

  getAvailableAxises() {
    return this.availableAxises.copy();
  }

  resetAvailableAxises() {
    this.availableAxises = Config.axisIndexes.copy();
  }
  // -----------------------------------------------------------------------------
  getQuestionFunction(): FunctionObj {
    let question = this.createQuestionFunction();
    this.usedQuestionFuncs.push(question.func);

    return question.func as FunctionObj;
  }

  getCorrectFunction(): FunctionObj {
    let correctFunction = this.createCorrectFunction();
    this.usedCorrectFuncs.push(correctFunction);

    return correctFunction as FunctionObj;
  }

  getIncorrectFunction(): FunctionObj {
    let incorrectFunction = this.createIncorrectFunction();
    this.usedIncorrectFuncs.push(incorrectFunction);

    return incorrectFunction as FunctionObj;
  }

  getComplexFunction(functionsLengths: Array<number>): Array<FunctionObj> {
    let complexFunction = this.createComplexFunction(functionsLengths);

    return complexFunction;
  }
  // -----------------------------------------------------------------------------
  private createQuestionFunction(): any {

    let question = {
      func: new FunctionObj(this.availableAxises.getRandom())
        .generateParams().clearParams(),
    };

    if (this.usedQuestionFuncs.length !== 0)
      for (const usedQuestion of this.usedQuestionFuncs)
        if (question.func.equalTo(usedQuestion.func))
          return this.createQuestionFunction();

    question.func.params.len = this.functionLength;
    if (this.isSnapping)
      question.func = question.func.snapToGrid();

    return question;
  }

  private createCorrectFunction(): FunctionObj {
    let question: any;

    if (this.usedQuestionFuncs.length === 0)
      throw Error("There are none of question function");

    question = this.usedQuestionFuncs.last();
    question.axises = this.getAvailableAxises();

    if (question.axises.length === 0)
      throw Error('There are none of available axises left.');

    const pickedAxis = question.axises.getRandom(),
      newParams = question.func.copyParams(),
      correctFunction = new FunctionObj(pickedAxis, newParams).makeCorrectParams().clearParams();

    question.axises.deleteItem(pickedAxis);
    correctFunction.params.len = this.functionLength;
    return this.isSnapping ? correctFunction.snapToGrid() : correctFunction;
  }

  private createIncorrectFunction(): FunctionObj {
    if (this.usedQuestionFuncs.length === 0)
      throw Error("There are none of question function");

    const question = this.usedQuestionFuncs.getRandom(),
      pickedAxis = this.availableAxises.getRandom(),
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

  private createComplexFunction(functionsLengths: Array<number>) {

    if (functionsLengths.length < Config.bounds.questionCount[0] || functionsLengths.length > Config.bounds.questionCount[1])
      throw Error('Amount of functions lengths must be greater than ' + Config.bounds.questionCount[0]
        + ' and less than ' + Config.bounds.questionCount[1])
    else {
      let count = 0;
      for (const length of functionsLengths) {
        if (length < Config.minLength)
          throw Error('Length must be greater than ' + Config.minLength)
        count += length
      }

      if (count > Config.defaultLength)
        throw Error('The sum of functions lengths values must be less than ' + Config.defaultLength)

    }

    let complexFunction = Array<FunctionObj>();

    complexFunction.push(this.createCorrectFunction());
    for (const length of functionsLengths) {
      complexFunction.push(complexFunction.last().createNextFunction(complexFunction, length))
    }

    return complexFunction;
  }

}
