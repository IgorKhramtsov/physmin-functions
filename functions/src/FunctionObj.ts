import { Utils } from './Util';
import { Config } from "./Config";

export class FunctionObj {
  params: any;
  funcType: string;

  constructor(_funcType?: string, _params?: any) {
    this.funcType = _funcType ? _funcType : "";
    this.params = _params ? _params : {};
  }

  // -----------------------------------------------------------------------------
  // Utils
  // -----------------------------------------------------------------------------
  equalTo(obj: FunctionObj): boolean {
    if (obj === undefined) return false;

    if (this.funcType === obj.funcType) {
      if (this.params.x !== undefined && obj.params.x !== undefined) {
        if ((Math.sign(this.params.x) === Math.sign(obj.params.x)) &&
          (Math.sign(this.params.v) === Math.sign(obj.params.v)) &&
          (Math.sign(this.params.a) === Math.sign(obj.params.a)))
          return true;
      }
      else if (this.params.v !== undefined && obj.params.v !== undefined) {
        if ((Math.sign(this.params.v) === Math.sign(obj.params.v)) &&
          (Math.sign(this.params.a) === Math.sign(obj.params.a))) {
          return true;
        }
      }
      else if (this.params.a !== undefined && obj.params.a !== undefined) {
        if ((Math.sign(this.params.a) === Math.sign(obj.params.a)))
          return true;
      }
    }
    return false;
  }

  equalToByDirection(obj: FunctionObj): boolean {
    if (obj === undefined || obj.params === undefined) {
      // console.log("equalToByDirection: obj undefined: ", obj)
      // FIXME: Somehow we get an array with one FO [FunctionObj]
      return false;
    }
    // Functions have equal directions when their dirivatives have equal sign
    let this_dir,
      nextFunc_dir;
    switch (obj.funcType) {
      case "x":
        this_dir = this.params.v + this.params.a * this.params.len;
        nextFunc_dir = obj.params.v + obj.params.a * obj.params.len;
        return Math.sign(this_dir) === Math.sign(nextFunc_dir);
      case "v":
        this_dir = this.params.a;
        nextFunc_dir = obj.params.a;
        return Math.sign(this_dir) === Math.sign(nextFunc_dir);
    }

    return false;
  }

  clearParams() {
    // Takes type of function and deletes unnecessary params for that type
    switch (this.funcType) {
      case "x":
        break;
      case "v":
        delete this.params.x;
        break;
      case "a":
        delete this.params.x;
        delete this.params.v;
        break;
    }
    return this;
  }

  makeFreeVariables(): FunctionObj {
    const paramsKeys = Object.keys(this.params),
      params = this.params;
    // Imputes necessary paramaters for that type of function
    if (this.funcType === "x") {
      if (!paramsKeys.contains("x"))
        params.x = Utils.getRandomNonZeroFromBound(Config.X);
      if (!paramsKeys.contains("v"))
        params.v = Utils.getRandomFromBound(Config.V);
    }
    if (this.funcType === "v")
      if (!paramsKeys.contains("v"))
        params.v = Utils.getRandomNonZeroFromBound(Config.V);

    return this;
  }

  generateParams() {
    let x, v, a = 0;
    x = Utils.getRandomFromBound(Config.X);
    v = Utils.getRandomFromBound(Config.V);
    if (Utils.withChance(0.7))
      a = Utils.getRandomNonZeroFromBound(Config.A);

    if (x === 0 && v === 0 && a === 0)
      this.generateParams();
    if (Math.sign(v) === Math.sign(a)) {
      if (Utils.withChance(0.5)) {
        if (v !== 0) v = -v;
      }
      else if (a !== 0) a = -a;
    }
    this.params = { "x": x, "v": v, "a": a };
    return this;
  }

  copyParams(): any {
    return Object.assign({}, this.params);
  }

  // -----------------------------------------------------------------------------
  // Creating FUNCTIONS
  // -----------------------------------------------------------------------------
  makeQuestionFunction(usedFuncs?: Array<FunctionObj>, funcLength: number = Config.defaultLength,
    availableAxises: Array<string> = Config.axisIndexes): FunctionObj {

    this.funcType = availableAxises.getRandom();
    this.generateParams().clearParams();

    if (usedFuncs)
      for (const func of usedFuncs)
        if (this.equalToByDirection(func))
          return this.makeQuestionFunction(usedFuncs, funcLength, availableAxises);

    this.params.len = funcLength;
    return this.snapToGrid();
  }

  getCorrectFunction(usedFunc?: Array<FunctionObj>, funcLength: number = Config.defaultLength,
    availableAxises: Array<any> = Config.axisIndexes): FunctionObj {
    // Filter available function types


    const _availableAxises = availableAxises.copy().deleteItem(this.funcType);

    if (usedFunc)
      for (const func of usedFunc)
        if (_availableAxises.legnth !== 0)
          _availableAxises.deleteItem(func.funcType);
        else throw Error('There are none of available axises.')

    let pickedAxis = _availableAxises.getRandom(),
      newParams = this.copyParams();

    if (pickedAxis === undefined)
      throw new Error("Cannot pick axis. Looks like available axises list is empty.");

    const newFunc = new FunctionObj(pickedAxis, newParams).makeCorrectParams().clearParams().snapToGrid();

    // if (usedFunc)
    //   for (const func of usedFunc) {
    //     if (newFunc.equalToByDirection(func))
    //       return this.getCorrectFunction(usedFunc, funcLength, _availableAxises);
    //   }

    newFunc.params.len = funcLength;
    return newFunc;
  }

  getIncorrectFunction(usedFunc?: Array<FunctionObj>, funcLength: number = Config.defaultLength,
    availableAxises: Array<any> = Config.axisIndexes): FunctionObj {

    // Filter available function types
    const _availableAxises = availableAxises.copy().deleteItem(this.funcType),
      pickedAxis = _availableAxises.getRandom(),
      newParams = this.copyParams();

    if (pickedAxis === undefined)
      throw new Error("Cannot pick axis. Looks like available axises list is empty.");

    const incorrectFunction = new FunctionObj(pickedAxis, newParams).makeIncorrectParams().clearParams();
    if (usedFunc)
      for (const func of usedFunc)
        if (incorrectFunction.equalTo(func))
          return this.getIncorrectFunction(usedFunc, funcLength, _availableAxises);

    incorrectFunction.params.len = funcLength;
    return incorrectFunction.snapToGrid();
  }

  makeCorrectParams(): FunctionObj {
    return this.makeFreeVariables();
  }

  makeIncorrectParams(): FunctionObj {
    const params = this.params,
      paramsKeys = Object.keys(params).deleteItem("len");
    // Inverting current params
    for (const key of paramsKeys) {
      switch (Math.sign(params[key])) {
        case 1:
        case -1:
          params[key] = Utils.withChance(0.5) ? -params[key] : 0;
          break;
        case 0:
          params[key] = Utils.withChance(0.5) ? 1 : -1;
          break;
      }
      params[key] = Utils.getRandomWithSign(key, params[key]);
    }
    return this.makeFreeVariables();
  }

  // -----------------------------------------------------------------------------
  // Wrangling with TEXT
  // -----------------------------------------------------------------------------
  getKeyByValue(object: any, value: any): String {
    // Returns text by value or sign
    let _key = Object.keys(object).find(key => object[key] === value)
    if (_key) return _key
    else throw Error("Key is not found!");
  }

  getTextDescription(flag: boolean): String {
    let params = this.params,
      text = "",
      x = params.x,
      v = params.v,
      a = params.a;
    // Returns desctiption of function behavior by its parameters
    // --------------------------------------------------------------------
    if (x !== undefined && v !== undefined && a !== undefined) {

      if (x == 0 && v == 0 && a == 0)
        text += this.getKeyByValue(Config.movement, 0) + ' ' +
          this.getKeyByValue(Config.position, 0);

      else if (x != 0 && v == 0 && a == 0)
        text += this.getKeyByValue(Config.movement, 0) + ' ' +
          this.getKeyByValue(Config.position, Math.sign(x));

      else {
        text += this.getKeyByValue(Config.movement, 1)
        if (v && v != 0) {
          text += ' ' + this.getKeyByValue(Config.directions, Math.sign(v));
          if (a && a != 0)
            text += ', ' + this.getKeyByValue(Config.how, Math.sign(a));
        }
        else if (a) {
          text += ' ' + this.getKeyByValue(Config.how, Math.sign(a));
        }
      }

    }
    // --------------------------------------------------------------------
    else if (v !== undefined && a !== undefined) {

      if (v == 0 && a == 0)
        text += this.getKeyByValue(Config.movement, 0);

      else {
        text += this.getKeyByValue(Config.movement, 1)
        if (v && v != 0) {
          text += ' ' + this.getKeyByValue(Config.directions, Math.sign(v));
          if (a && a != 0)
            text += ', ' + this.getKeyByValue(Config.how, Math.sign(a));
        }
        else if (a)
          text += ' ' + this.getKeyByValue(Config.how, Math.sign(a));
      }
    }
    // --------------------------------------------------------------------
    else if (a !== undefined) {
      if (a == 0)
        text += this.getKeyByValue(Config.movement, 0);
      else
        text += this.getKeyByValue(Config.how, Math.sign(a));
    }
    // --------------------------------------------------------------------
    else throw new Error('Incorrect func type.')

    if (flag) {
      if (text[0] === ' ')
        text = text.substr(1);
      text = text.charAt(0).toUpperCase() + text.slice(1);
    }
    return text;
  }

  // -----------------------------------------------------------------------------
  // For complex FUNCTIONS
  // -----------------------------------------------------------------------------
  snapToGrid() {
    const funcType = this.funcType,
      params = this.params,
      len = this.params.len;

    if (funcType == 'x' || funcType == 'v')
      params[funcType] = Math.round(params[funcType]);

    const value = Math.round(this.calculateFunctionValue(len));
    let result = 0;
    if (value != 0)
      result = Math.min(Math.abs(value), Config.upperLimit) * Math.sign(value);
    // if (result == -0) result = 0;

    switch (funcType) {
      case "x":
        if (params.v !== 0 && params.a !== 0) {
          let v_calc = (result - params.x - (params.a * len * len) / 2) / len,
            a_calc = 2 * (result - params.x - params.v * len) / (len * len),
            sign_a = Math.sign(params.a), sign_v = Math.sign(params.v);

          if (sign_a === Math.sign(a_calc) && sign_v === Math.sign(v_calc)) {
            if (sign_v === 0)
              params.a = a_calc;
            else
              params.v = v_calc;
          }
          else if (sign_a === -Math.sign(a_calc))
            params.v = v_calc;
          else if (sign_v === -Math.sign(v_calc))
            params.a = a_calc;
          else throw Error("Case 'x'. Incorrect composition of params.")
        }
        else if (params.v !== 0) params.v = (result - params.x - (params.a * len * len) / 2) / len;
        else if (params.a !== 0) params.a = 2 * (result - params.x - params.v * len) / (len * len);
        break;
      case "v":
        if (params.a !== 0) {
          params.a = (result - params.v) / len;
        }
        break;
    }
    return this;
  }

  createNextFunction(usedFunctions?: Array<FunctionObj>, _len?: number, recursive_count?: number): FunctionObj {
    const funcType = this.funcType,
      nextFunc = new FunctionObj(funcType).generateParams().clearParams();

    if (!recursive_count) recursive_count = 1;
    else if (recursive_count === 30) throw new Error('To much recursive calls.')

    const len = _len ? _len : Config.defaultLength / 2;
    nextFunc.params.len = len;

    this.snapToGrid();
    if (!this.params.len) throw new Error("this.params.len is undefined");
    nextFunc.params[funcType] = Math.round(this.calculateFunctionValue(this.params.len));


    if (nextFunc.params[funcType] >= (Config.upperLimit - 1)) {
      let params = nextFunc.params,
        first = params.x ? "x" : "v",
        second = params.v ? "v" : "a",
        third = params.a ? "a" : undefined;
        // FIXME:       V always on side of X
      if (nextFunc.params[second] !== 0)
        nextFunc.params[second] = -Math.sign(nextFunc.params[first]) * Math.abs(nextFunc.params[second]);
      if (third && nextFunc.params[third] !== 0)
       // FIXME:                 Math.sign(nextFunc.params[SECOND?????????]) to be opposite of V???
        nextFunc.params[third] = Math.sign(nextFunc.params[first]) * Math.abs(nextFunc.params[third]);
    }

    if (usedFunctions) {
      for (const func of usedFunctions)
        if (nextFunc.equalToByDirection(func))
          return this.createNextFunction(usedFunctions, len, ++recursive_count);
      // if (nextFunc.equalToByDirection(usedFunctions.last())) {
      //   return this.createNextFunction(usedFunctions, len, ++recursive_count);
      // }
    }

    return nextFunc;
  }

  // -----------------------------------------------------------------------------
  // Computing
  // -----------------------------------------------------------------------------
  calculateFunctionValue(t: number): number {
    const params = this.params;

    switch (this.funcType) {
      case "x":
        return params.x + params.v * t + (params.a * t * t) / 2;
      case "v":
        return params.v + params.a * t;
      case "a":
        return params.a;
    }
    throw Error('Incorrect type of function.')
  }

  calcIntegral(): number {
    const params = this.params;
    switch (this.funcType) {
      case "x":
        return params.x * params.len + (params.v * params.len * params.len) / 2 +
          (params.a * params.len * params.len * params.len) / 6;
      case "v":
        return params.v * params.len + (params.a * params.len * params.len) / 2;
    }
    return 0;
  }

  static calcFuncValueFromRange(start: number, end: number, functions: Array<FunctionObj>): number {
    // Returns area below function on coordinate plane
    let result = 0;
    for (let i = start; i < end + 1; i++)
      result += functions[i].calcIntegral();
    return result;
  }


  // -----------------------------------------------------------------------------
  // Holy shet for RELATION SIGNS
  // -----------------------------------------------------------------------------
  static getIndexes(questionCount: number, answersCount: number): Array<Array<Array<number>>> {
    let indexes = Array<Array<Array<number>>>();
    // Returns unique couple of indices (read - points) on coordinate plane
    for (let i = 0; i < answersCount; i++) {
      indexes.push(FunctionObj.createNextCoupleIndexes(questionCount, indexes));
    }
    return indexes;
  }

  static createNextCoupleIndexes(questionCount: number, usedCoupleIndexes: Array<Array<Array<number>>>, recursive_count?: number): Array<Array<number>> {
    if (!recursive_count) recursive_count = 1;
    else if (recursive_count === 30) throw new Error('To much recursive calls.')

    const leftCoupleIndexes = FunctionObj.createNextIndex(questionCount),
      rightCoupleIndexes = FunctionObj.createNextIndex(questionCount, [leftCoupleIndexes]);

    let nextCoupleIndexes = [leftCoupleIndexes, rightCoupleIndexes];

    // Sorts indices of couple
    if (leftCoupleIndexes[0] > rightCoupleIndexes[0])
      nextCoupleIndexes = [rightCoupleIndexes, leftCoupleIndexes];
    else if (leftCoupleIndexes[0] === rightCoupleIndexes[0])
      if (leftCoupleIndexes[1] > rightCoupleIndexes[1])
        nextCoupleIndexes = [rightCoupleIndexes, leftCoupleIndexes];

    if (usedCoupleIndexes)
      for (const coupleIndexes of usedCoupleIndexes)
        if (FunctionObj.indexToString(nextCoupleIndexes[0]) === FunctionObj.indexToString(coupleIndexes[0]) &&
          FunctionObj.indexToString(nextCoupleIndexes[1]) === FunctionObj.indexToString(coupleIndexes[1])) {
          return FunctionObj.createNextCoupleIndexes(questionCount, usedCoupleIndexes, ++recursive_count);
        }
    return nextCoupleIndexes;
  }

  static createNextIndex(questionCount: number, usedIndex?: Array<Array<number>>): Array<number> {
    let leftIndex, rightIndex, count = 0;

    rightIndex = questionCount.getRandom();

    for (count = 0; count < 30 && (leftIndex === rightIndex || leftIndex === undefined); count++)
      leftIndex = questionCount.getRandom();
    if (leftIndex === rightIndex || leftIndex === undefined) throw new Error('To many cicle iterations.');

    const nextIndex = [leftIndex, rightIndex].sort();
    if (usedIndex)
      for (const index of usedIndex)
        if (index[0] === nextIndex[0] && index[1] === nextIndex[1])
          return FunctionObj.createNextIndex(questionCount, usedIndex);

    return nextIndex;
  }

  static indexToString(index: Array<number>): String {
    return index[0].toString() + index[1].toString();
  }
}
