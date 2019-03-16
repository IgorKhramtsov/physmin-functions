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
Array.prototype.deleteItem = function <T>(this: T[], item: T): any {
    if (this.indexOf(item) != -1)
        this.splice(this.indexOf(item), 1);
    return this;
};

const axisIndex = [
    'x', 'v', 'a'
];
const bounds = {
    x: [-2, 2], // x
    v: [-1, 1], // v
    a: [-0.5, 0.5], // a
} as any;

const X = "x";
const V = "v";
const A = "a";

function getRandomFromBound(axis: string) {
    let value = getRandomFromRange(bounds[axis][0], bounds[axis][1]);
    if (Math.abs(value) <= 0.3)
        value = 0;
    return value
}

function getRandomNonZeroFromBound(axis: string): number {
    let value = getRandomFromRange(bounds[axis][0], bounds[axis][1]);
    if (Math.abs(value) <= 0.3)
        value = 0;

    if (value == 0)
        return getRandomNonZeroFromBound(axis);
    return value
}

function getRandomFromRange(min: number, max: number) {
    return min + (max - min).getRandomF();
}

class FunctionObj {
    params: any;
    funcType: string;

    constructor(_functType: string, _params: any) {
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
        return this;
    }

    getCorrectFunction(usedFunc?: any) {
        let availableAxises = axisIndex.slice().deleteItem(this.funcType);
        if (usedFunc) availableAxises.deleteItem(usedFunc.funcType);

        let newParams = JSON.parse(JSON.stringify(this.params));
        let pickedAxis = availableAxises.getRandom();

        return new FunctionObj(pickedAxis, newParams).makeCorrectParams();
    }

    makeCorrectParams() {
        let axises = Object.keys(this.params),
            params = this.params;

        if (axises.indexOf("x") == -1 && this.funcType == "x")
            params.x = getRandomNonZeroFromBound(X);
        if (axises.indexOf("v") == -1 && (this.funcType == "x" || this.funcType == "v"))
            params.v = getRandomNonZeroFromBound(V);

        this.makeClearer();
    }

    getIncorrectFunction(usedFuncs?: Array<any>): FunctionObj {
        let availableAxises = axisIndex.slice().deleteItem(this.funcType);

        let newParams = JSON.parse(JSON.stringify(this.params)),
            pickedAxis = availableAxises.getRandom();

        let incorrectFunction = new FunctionObj(pickedAxis, newParams).makeIncorrectParams().clearParams();
        if (usedFuncs)
            for (let answer of usedFuncs) {
                if (answer == undefined)
                    continue;
                if (incorrectFunction.equalTo(answer.graph as FunctionObj))
                    return this.getIncorrectFunction(usedFuncs);
            }

        return incorrectFunction;
    }

    makeIncorrectParams() {
        let params = this.params,
            paramsKeys = Object.keys(params);

        // Invert current params
        for (let p_key of paramsKeys) {
            switch (Math.sign(params[p_key])) {
                case 1:
                case -1:
                    params[p_key] = withChance(0.5) ? -params[p_key] : 0;
                    break;
                case 0:
                    params[p_key] = withChance(0.5) ? 1 : -1;
                    break;
            }
            params[p_key] = getRandomNonZeroFromBound(p_key) * Math.sign(params[p_key]);
        }

        let a: string,
            b: string;
        if (Math.sign(params["v"]) == Math.sign(params["a"]) && Math.sign(params["a"]) != 0) {
            if (withChance(0.5)) {
                a = "v";
                b = "a";
            } else {
                a = "a";
                b = "v";
            }

            params[a] = withChance(0.5) ? -params[b] : 0;
            params[a] = getRandomNonZeroFromBound(a) * Math.sign(params[b]);
        }


        // Add deficit params
        if (this.funcType == "x") {
            if (paramsKeys.indexOf("x") == -1)
                params.x = getRandomNonZeroFromBound(X);
            if (paramsKeys.indexOf("v") == -1)
                params.v = getRandomFromBound(V);
        }
        if (this.funcType == "v")
            params.v = getRandomNonZeroFromBound(V);

        return this;
    }

    generateParams() {
        let x, v, a = 0;
        x = getRandomFromBound(X);
        v = getRandomFromBound(V);
        if (withChance(0.5))
            a = getRandomFromBound(A);

        if (x == 0 && v == 0 && a == 0)
            this.generateParams();

        return {"x": x, "v": v, "a": a};
    }

    makeQuestionFunction(prevFunc?: Array<FunctionObj>): FunctionObj {
        let funcType = axisIndex.getRandom();
        this.generateParams();

        if (prevFunc)
            for (let func of prevFunc)
                if (this.equalTo(func))
                    return this.makeQuestionFunction(prevFunc);

        switch (funcType) {
            case "x":
                return this;
            case "v":
                delete this.params.x;
                return this;
            case "a":
                delete this.params.x;
                delete this.params.v;
                return this;
        }
        return this;
    }

    makeClearer() {
        if (this.params.x == 0 && this.params.v == 0 && this.params.a != 0)
            this.params.a *= 10;
        else if (this.params.x == 0 && this.params.a == 0 && this.params.v != 0)
            this.params.v *= 3;
        return this;
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
    let count = 6,
        question = test.question,
        answers = test.answers;

    question.graph = new FunctionObj("", {}).makeQuestionFunction();
    question.correctID = Array<any>();
    if (answerCount == 1) {
        let correctID = count.getRandom();

        question.correctID[0] = correctID;
        answers[correctID] = {
            graph: question.graph.getCorrectFunction(),
            id: correctID
        };
        for (let i = 0; i < count; i++) {
            if (i == correctID)
                continue;
            answers[i] = {
                graph: question.graph.getIncorrectFunction(answers),
                id: i
            };
        }
    } else {
        test.type = "graph2graph2";
        question.correctID[0] = count.getRandom();
        //Should be reworked for next types of tests/quiz
        do question.correctID[1] = count.getRandom();
        while (question.correctID[1] == question.correctID[0]);

        answers[question.correctID[0]] = {
            graph: question.graph.getCorrectFunction(),
            id: question.correctID[0]
        };
        answers[question.correctID[1]] = {
            graph: question.graph.getCorrectFunction(answers[question.correctID[0]].graph),
            id: question.correctID[1]
        };
        for (let i = 0; i < count; i++) {
            if (question.correctID.indexOf(i) != -1)
                continue;
            answers[i] = {
                graph: question.graph.getIncorrectFunction(answers),
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

function withChance(value: number) {
    return Math.random() <= value;
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


