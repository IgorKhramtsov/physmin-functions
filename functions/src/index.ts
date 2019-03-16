import * as functions from 'firebase-functions';


// TODO: move function to class methods
// TODO: create 'chance' function

declare global {
    interface Number {
        toFloor(): number;
        getRandom(): number;
        getRandomF(): number;
    }

    interface Array<T> {
        getRandom(): T;
        deleteItem(item: T): any;
    }
}
Number.prototype.toFloor = function (this: number): number {
    return Math.floor(this);
};
Number.prototype.getRandom = function (this: number): number {
    return Math.floor(Math.random() * this);
};
Number.prototype.getRandomF = function (this: number): number {
    return Math.random() * this;
};
Array.prototype.getRandom = function <T>(this: T[]): T {
    return this[this.length.getRandom()];
};
Array.prototype.deleteItem = function<T> (this: T[], item: T):any {
    if(this.indexOf(item) != -1)
        this.splice(this.indexOf(item), 1);
};

const axisIndex = [
    'x', 'v', 'a'
];
const  bounds = {
    x: [-2, 2], // x
    v: [-1, 1], // v
    a: [-0.5, 0.5], // a
} as any;

const X = "x";
const V = "v";
const A = "a";

function getRandomFromBound(axis: string) {
    let value = getRandomFromRange(bounds[axis][0], bounds[axis][1]);
    if(Math.abs(value) <= 0.3)
        value = 0;
    return value
}
function getRandomNonZeroFromBound(axis: string): number {
    let value = getRandomFromRange(bounds[axis][0], bounds[axis][1]);
    if(Math.abs(value) <= 0.3)
        value = 0;

    if(value == 0)
        return getRandomNonZeroFromBound(axis);
    return value
}
function getRandomFromRange(min: number, max: number) {
    return min + (max - min).getRandomF();
}

class FunctionObj {
    params: any;
    funcType: string;

    constructor(_functType: string,  _params: any) {
        //this.params = {x: _x, v: _v, a: _a};
        this.params = _params;

        this.funcType = _functType;
    }

    equalTo(obj: FunctionObj) {
        if (this.funcType == obj.funcType)
            if (Math.sign(this.params.x) == Math.sign(obj.params.x) &&
                Math.sign(this.params.v) == Math.sign(obj.params.v) &&
                Math.sign(this.params.a) == Math.sign(obj.params.a))
                return true;
        return false;
    }

    clearParams() {
        switch (this.funcType) {
            case "x":
                break;
            case "v":
                this.params.x = 0;
                break;
            case "a":
                this.params.x = 0;
                this.params.v = 0;
                break;
        }
    }
}

function getG2Gtest(test_id: number, answerCount: number) {
    let test = {
        type: "graph2graph",
        test_id: test_id,
        title: "",
        question: {} as any,
        answers: Array<any>()
    } as any;
    let count = 6;

    if(answerCount == 2)
        test.type = "graph2graph2";

    test.question.graph = getQuestionFunction();
    test.question.correctID = Array<any>();
    if (answerCount == 1) {
        let correctID = count.getRandom();

        test.question.correctID[0] = correctID;
        test.answers[correctID] = {
            graph: getCorrectFunction(test.question.graph),
            id: correctID
        };
        for (let i = 0; i < count; i++) {
            if (i == correctID)
                continue;
            test.answers[i] = {
                graph: getIncorrectFunction(test.question.graph, test.answers),
                id: i
            };
        }
    } else {
        test.question.correctID[0] = count.getRandom();
        do test.question.correctID[1] = count.getRandom();
        while (test.question.correctID[1] == test.question.correctID[0]);

        test.answers[test.question.correctID[0]] = {
            graph: getCorrectFunction(test.question.graph),
            id: test.question.correctID[0]
        };
        test.answers[test.question.correctID[1]] = {
            graph: getCorrectFunction(test.question.graph, test.answers[test.question.correctID[0]].graph),
            id: test.question.correctID[1]
        };
        for (let i = 0; i < count; i++) {
            if (test.question.correctID.indexOf(i) != -1)
                continue;
            test.answers[i] = {
                graph: getIncorrectFunction(test.question.graph, test.answers),
                id: i
            };
        }
    }
    return test;
}

// function getG2Stest(test_id: number) {
//     let test = {
//         type: "graph2state",
//         test_id: test_id,
//         title: "",
//         question: [{}],
//         answers: Array<Object>()
//     } as any;
//     let answerCount = 6,
//         questionCount = 4;
//
//     let correctIDs = [];
//     for (let i = 0; i < questionCount; i++) {
//         do correctIDs[i] = questionCount.getRandom();
//         while (correctIDs.indexOf(correctIDs[i]) == 1);
//         test.question[i] = getQuestionFunction(test.question);
//         test.question[i].correctID = correctIDs[i];
//     }
//     for (let i = 0; i < answerCount; i++) {
//         if (correctIDs.indexOf(i) == 1)
//             test.answers[correctIDs[i]] = getCorrectFunction(test.question);
//         else test.answers[correctIDs[i]] = getIncorrectFunction(test.question);
//     }
// }
//
// function getCorrectText() {
//
// }

function generateParams() {
    let x, v, a = 0;
    x = getRandomFromBound(X);
    v = getRandomFromBound(V);
    if (Math.round(Math.random()))
        a = getRandomFromBound(A);

    if(x == 0 && v == 0 && a == 0)
        generateParams();
    // else if(x == 0 && v == 0 && a != 0) // if only 1 value, make it more clear
    //     a *= 10;
    // else if(x == 0 && a == 0 && v != 0)
    //     v *= 3;

    return {"x": x, "v": v, "a": a};
}

function getQuestionFunction(prevFunc?: Array<FunctionObj>): FunctionObj {
    let funcType = axisIndex.getRandom();
    let _params = generateParams();
    let _function = new FunctionObj(funcType, _params);

    if (prevFunc)
        for (let func of prevFunc)
            if(_function.equalTo(func))
                return getQuestionFunction(prevFunc);

    switch (funcType) {
        case "x":
            return _function;
        case "v":
            delete _function.params.x;
            return _function;
        case "a":
            delete _function.params.x;
            delete _function.params.v;
            return _function;
    }
    return _function;
}

function getCorrectFunction(questionFunc: FunctionObj, usedFunc?: any) {
    let availableAxises = axisIndex.slice();
    availableAxises.deleteItem(questionFunc.funcType);
    if (usedFunc) availableAxises.deleteItem(usedFunc.funcType);

    let newParams = JSON.parse(JSON.stringify(questionFunc.params));
    let pickedAxis = availableAxises.getRandom();

    let correctFunction = new FunctionObj(pickedAxis, newParams);
    makeCorrectParams(correctFunction);
    return correctFunction;
}

function makeCorrectParams(pickedFunc: FunctionObj) {
    let axises = Object.keys(pickedFunc.params);
    let params = pickedFunc.params;

    if (axises.indexOf("x") == -1 && pickedFunc.funcType == "x") {
        do params.x = getRandomFromBound(X);
        while (params.x == 0);
    }
    if (axises.indexOf("v") == -1 && (pickedFunc.funcType == "x" || pickedFunc.funcType == "v")) {
        do params.v = getRandomFromBound(V);
        while (params.v == 0);
    }
    makeClearer(pickedFunc);
}

function getIncorrectFunction(questionFunc: FunctionObj, usedFuncs?: Array<any>, recurseCount?: number): FunctionObj {
    let availableAxises = axisIndex.slice();
    availableAxises.deleteItem(questionFunc.funcType);

    let newParams = JSON.parse(JSON.stringify(questionFunc.params));
    let pickedAxis = availableAxises.getRandom();

    let incorrectFunction = new FunctionObj(pickedAxis, newParams);
    makeIncorrectParams(incorrectFunction);
    incorrectFunction.clearParams();

    if(usedFuncs)
        for(let answer of usedFuncs) {
            if(answer == undefined)
                continue;
            if(recurseCount && recurseCount > 50)
                console.log("qft: " + questionFunc.funcType + " ift: " + incorrectFunction.funcType);
            if (incorrectFunction.equalTo(answer.graph as FunctionObj))
                return getIncorrectFunction(questionFunc, usedFuncs, recurseCount? recurseCount+1: 1);
        }

    return incorrectFunction;
}

function makeIncorrectParams(pickedFunc: FunctionObj) {
    let params = pickedFunc.params;
    let paramsKeys = Object.keys(params);

    // Invert current params
    for (let p_key of paramsKeys) {
        switch (Math.sign(params[p_key])) {
            case 1:
            case -1:
                params[p_key] = Math.round(Math.random()) ? -params[p_key] : 0;
                break;
            case 0:
                params[p_key] = Math.round(Math.random()) ? 1 : -1;
                break;
        }
        params[p_key] = getRandomNonZeroFromBound(p_key) * Math.sign(params[p_key]);
    }

    let a: string;
    let b: string;
    if(Math.sign(params["v"]) == Math.sign(params["a"]) && Math.sign(params["a"]) != 0) {
        if (Math.floor(Math.random())) {
            a = "v";
            b = "a";
        } else {
            a = "a";
            b = "v";
        }

        params[a] = Math.round(Math.random()) ? -params[b] : 0;
        params[a] = getRandomNonZeroFromBound(a) * Math.sign(params[b]);
    }



    // Add deficit params
    if(pickedFunc.funcType == "x") {
        if (paramsKeys.indexOf("x") == -1)
            params.x = getRandomNonZeroFromBound(X);
        if (paramsKeys.indexOf("v") == -1)
            params.v = getRandomFromBound(V);
    }
    if(pickedFunc.funcType == "v") {
        params.v = getRandomNonZeroFromBound(V);
    }
    // makeClearer(pickedFunc);
}

function makeClearer(functionObj: FunctionObj) {
    let params = functionObj.params;
    if (params.x == 0 && params.v == 0 && params.a != 0) // if only 1 value, make it more clear
        params.a *= 10;
    else if (params.x == 0 && params.a == 0 && params.v != 0)
        params.v *= 3;
}

// exports.getTest = functions.region("europe-west1").https.onRequest((request, resp) => {
exports.getTest = functions.region("europe-west1").https.onCall((data, context) => {

    let testQuiz = {tests: Array<any>()};

    testQuiz.tests[0] = getG2Gtest(0, 1);
    testQuiz.tests[1] = getG2Gtest(1, 1);
    testQuiz.tests[2] = getG2Gtest(2, 1);
    testQuiz.tests[3] = getG2Gtest(3, 1);

    testQuiz.tests[4] = getG2Gtest(4, 2);
    testQuiz.tests[5] = getG2Gtest(5, 2);
    testQuiz.tests[6] = getG2Gtest(6, 2);
    testQuiz.tests[7] = getG2Gtest(7, 2);

    // resp.send( JSON.stringify(quiz));
    return JSON.stringify(testQuiz)
});


