import { FunctionObj } from './FunctionObj'
import { Config } from "./Config";

export class FunctionBuilder {
  private usedQuestionFuncs: Array<any>;
  private usedCorrectFuncs: Array<FunctionObj>;
  private usedIncorrectFuncs: Array<FunctionObj>;

  private isSnapping: boolean;
  private functionLength: number;
  private restrictedAxises: Array<String>;

  constructor() {
    this.usedQuestionFuncs = Array<any>();
    this.usedCorrectFuncs = Array<FunctionObj>();
    this.usedIncorrectFuncs = Array<FunctionObj>();

    this.isSnapping = false;
    this.functionLength = Config.defaultLength;
    this.restrictedAxises = Array<String>();
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
    else if (length === 0) this.functionLength = Config.defaultLength;
    this.functionLength = length;

    return this;
  }

  restrictAxis(axis: string) {
    if (Config.axisIndexes.contains(axis) === false) throw Error('Incorrect axis.')
    this.restrictedAxises.push(axis);
  }
  releaseAxis(axis: string){
    if(this.restrictedAxises.contains(axis) === false) throw Error('Axis already released.')
    this.restrictedAxises.deleteItem(axis);
  }

  getRandomQuestionFunction(){
    return this.usedQuestionFuncs.getRandom();
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

  // -----------------------------------------------------------------------------
  private createQuestionFunction(): any {

    let question = {
      func: new FunctionObj(),
      axises: Config.axisIndexes
    };
    question.func.funcType = question.axises.getRandom();
    question.func.generateParams().clearParams();
    question.axises.deleteItem(question.func.funcType);

    if (this.usedQuestionFuncs.length !== 0)
      for (const usedQuestion of this.usedQuestionFuncs)
        if (question.func.equalTo(usedQuestion.func))
          return this.createQuestionFunction();

    question.func.params.len = this.functionLength;
    question.func = this.isSnapping ? question.func.snapToGrid() : question.func;
    return question;
  }

  private createCorrectFunction(): FunctionObj {

    if (this.usedQuestionFuncs.length === 0)
      this.usedQuestionFuncs.push(this.createQuestionFunction());

    const question = this.usedQuestionFuncs.last();
    if (question.axises.length === 0) throw Error('There are none of available axises.')

    const pickedAxis = question.axises.getRandom(),
      newParams = question.func.copyParams(),
      correctFunction = new FunctionObj(pickedAxis, newParams).makeCorrectParams().clearParams();

    question.axises.deleteItem(pickedAxis);
    correctFunction.params.len = this.functionLength;
    return this.isSnapping ? correctFunction.snapToGrid() : correctFunction;
  }

  private createIncorrectFunction(): FunctionObj {

    if (this.usedQuestionFuncs.length === 0)
      this.usedQuestionFuncs.push(this.createQuestionFunction());

    const question = this.usedQuestionFuncs.getRandom();
    if (question.axises.length === 0) throw Error('There are none of available axises.')

    const pickedAxis = question.axises.getRandom(),
      newParams = question.func.copyParams(),
      incorrectFunction = new FunctionObj(pickedAxis, newParams).makeIncorrectParams().clearParams();

    if (this.usedIncorrectFuncs)
      for (const func of this.usedIncorrectFuncs)
        if (incorrectFunction.equalTo(func))
          return this.createIncorrectFunction();

    incorrectFunction.params.len = this.functionLength;
    return this.isSnapping ? incorrectFunction.snapToGrid() : incorrectFunction;
  }

}
