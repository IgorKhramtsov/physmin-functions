import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
// import {object} from "firebase-functions/lib/providers/storage";
// import Firestore = admin.firestore.Firestore;
// import {settings} from "cluster";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

// TODO: Change test format.
// TODO: change QUESTION to QUESTION_S as array always


declare global {
    interface Number {
        toFloor(): number;

        getRandom(): number;
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
Array.prototype.getRandom = function <T>(this: T[]): T {
    return this[this.length.getRandom()];
};
Array.prototype.deleteItem = function<T> (this: T[], item: T):any {
    if(this.indexOf(item) != -1)
        this.splice(this.indexOf(item), 1);
};


const app = admin.initializeApp();
const db = admin.firestore(app);
//
// const correctAnswers_1_1 = [['graph_x_6', 'graph_v_7', 'graph_a_3'],
//     ['graph_x_5', 'graph_v_5', 'graph_a_2'],
//     ['graph_x_2', 'graph_x_1', 'graph_v_1', 'graph_a_1'],
//     ['graph_x_3', 'graph_v_3', 'graph_a_1'],
//     ['graph_x_7', 'graph_v_4', 'graph_a_2'],
//     ['graph_x_8', 'graph_v_6', 'graph_a_3'],
//     ['graph_x_4', 'graph_v_2', 'graph_a_1']];
// const funcTypes = [
//     'arcCW',
//     'acrCCW',
//     'line',
// ];
const axisIndex = [
    'a', 'v', 'x'
];
const bounds = [
    [-3, 3], // x
    [-3, 3], // v
    [-3, 3], // a
];

const X = 0;
const V = 1;
const A = 2;

function getRandomFromBound(number: number) {
    if (Math.random() <= 0.33)
        return 0;
    return getRandomFromRange(bounds[number][0], bounds[number][1]);
}

function getRandomFromRange(min: number, max: number) {
    return min + (max - min).getRandom();
}


// exports.createAnswerMap = functions.https.onRequest(async (req, res) => {
//     let answersMap: Map<string, Array<string>> = new Map();
//
//     correctAnswers_1_1.forEach((row) => {
//         row.forEach((col) => {
//             let list: Array<string> = [];
//             if (answersMap.has(col))
//                 list = answersMap.get(col)!;
//
//             row.forEach((_col) => {
//                 if (_col == col)
//                     return;
//                 if (list.indexOf(_col) == -1)
//                     list.push(_col)
//             });
//             answersMap.set(col, list);
//
//         });
//     });
//     let data = {} as any;
//
//     answersMap.forEach((a, b) => {
//         data[b] = a;
//     });
//     await db.collection('answer_map').doc('test_1.1').set(data).then(ref => {
//         res.status(200).send("Answer map added to firestore database!")
//     })
// });

function getG2Stest(doc: DocumentSnapshot) {
    let count = 6;
    let test = {
        type: "state2graph",
        test_id: 0,
        title: "",
        question: Array<Object>(),
        answers: Array<Object>()
    } as any;

    const answer_map = doc.data() as any;
    const answer_keys = Object.keys(answer_map);
    const usedPics = Array<string>();
    const corrIds = Array<Number>();

    let pic: string;
    let corr_id: number;
    let correct_answers: Array<string>;
    for(let i = 0; i < 4; i++) {
        do pic = answer_keys.getRandom();
        while (usedPics.indexOf(pic) != -1);
        do corr_id = count.getRandom();
        while (corrIds.indexOf(corr_id) != -1);
        correct_answers = answer_map[pic];
        test.question[i] = {
            correct_id: corr_id,
            picture_name: pic
        };
        test.answers[corr_id] = {
            id: corr_id,
            state: correct_answers.getRandom()
        };
        usedPics.push(pic);
        corrIds.push(corr_id);
        answer_keys.splice(answer_keys.indexOf(pic), 1); // Delete choosed key from array of keys
    }
    for(let i = 0; i < count; i++) {
        if(corrIds.indexOf(i) == -1) {
            pic = answer_keys.getRandom();
            test.answers[i] = {
                id: i,
                state: (answer_map[pic] as Array<string>).getRandom()
            };
        }
    }

    return test;
}
function getG2Gtest(count: number, quest_type: number, doc: DocumentSnapshot): any {
    let test = {
        type: "graph2graph",
        test_id: 0,
        title: "",
        question: {
            picture: "",
            correct_ids: Array<any>()
        },
        answers: Array<Object>()
    } as any;
    if (quest_type == 2)
        test.type = "graph2graph2";

    const answer_map = doc.data() as any;
    const answer_keys = Object.keys(answer_map);
    const usedPics = Array<string>();

    const corr_key = answer_keys.getRandom();
    const correct_answers = answer_map[corr_key] as Array<string>;
    answer_keys.splice(answer_keys.indexOf(corr_key), 1); // Delete choosed key from array of keys

    test.question.picture = corr_key;
    usedPics.push(test.question.picture);
    let corr_id;
    for(let i = 0; i < quest_type; i++) {
        do corr_id = count.getRandom();
        while (test.question.correct_ids.indexOf(corr_id) != -1);
        test.question.correct_ids.push(corr_id);
    }
    let pic: string;
    for(let i = 0; i < quest_type; i++) {
        do pic = correct_answers[correct_answers.length.getRandom()];
        while (usedPics.indexOf(pic) != -1);
        usedPics.push(pic);
        test.answers[test.question.correct_ids[i]] = {
            id: test.question.correct_ids[i],
            picture_name: pic
        };
    }
    let cache_answer_arr;
    for (let i = 0; i < count; i++) {
        if ( test.question.correct_ids.indexOf(i) == -1) {
            do {
                cache_answer_arr = answer_map[answer_keys.getRandom()];
                pic = cache_answer_arr[cache_answer_arr.length.getRandom()];
            } while (usedPics.indexOf(pic) != -1 || correct_answers.indexOf(pic) != -1);
            usedPics.push(pic);

            test.answers[i] = {id: i, picture_name: pic};
        }
    }
    return test;
}

exports.getTest = functions.region("europe-west1").https.onCall(async (data, context) => {
    let count = 8;
    if (data != undefined && data.count != undefined)
        count = data.count;

    let test = {tests: Array<any>()};

    return await db.collection('test_1.1').doc('answer_map').get().then(async doc => {
        test.tests[0] = getG2Gtest(count, 1, doc);
        test.tests[1] = getG2Gtest(count, 2, doc);
        return await db.collection('test_1.3').doc('answer_map').get().then(doc2 => {
            test.tests[2] = getG2Stest(doc2);

            return JSON.stringify(test);
        });
    });

});



function getG2GtestNew(test_id: number, answerCount: number) {
    let test = {
        type: "graph2graph",
        test_id: test_id,
        title: "",
        question: {},
        answers: Array<Object>()
    } as any;
    let count = 8;

    if(answerCount == 2)
        test.type = "graph2graph2";

    test.question = getQuestionFunction();
    test.question.correctID = Array<any>();
    if (answerCount == 1) {
        let correctID = count.getRandom();

        test.question.correctID = [correctID];
        test.answers[correctID] = getCorrectFunction(test.question);
        test.answers[correctID].id = correctID;
        for (let i = 0; i < count; i++) {
            if (i == correctID)
                continue;
            test.answers[i] = getWrongFunction(test.question);
            test.answers[i].id = i;
        }
    } else {
        test.question.correctID[0] = count.getRandom();
        do test.question.correctID[1] = count.getRandom();
        while (test.question.correctID[1] == test.question.correctID[0]);

        test.answers[test.question.correctID[0]] = getCorrectFunction(test.question);
        test.answers[test.question.correctID[0]].id = test.question.correctID[0];
        test.answers[test.question.correctID[1]] = getCorrectFunction(test.question, test.answers[test.question.correctID[0]]);
        test.answers[test.question.correctID[1]].id = test.question.correctID[1];
        for (let i = 0; i < count; i++) {
            if (test.question.correctID.indexOf(i) != -1)
                continue;
            test.answers[i] = getWrongFunction(test.question);
            test.answers[i].id = i;
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
//         else test.answers[correctIDs[i]] = getWrongFunction(test.question);
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

    return {"x": x, "v": v, "a": a};
}

function getQuestionFunction(prevFunc?: Array<any>): any {
    let funcType = axisIndex.getRandom();
    let _params = generateParams();

    if (prevFunc)
        for (let func of prevFunc)
            if (funcType == func.funcType)
                if (Math.sign(_params.x) == Math.sign(func.params.x) &&
                    Math.sign(_params.v) == Math.sign(func.params.v) &&
                    Math.sign(_params.a) == Math.sign(func.params.a))
                    return getQuestionFunction(prevFunc);

    switch (funcType) {
        case "x":
            return {funcType: funcType, params: _params};
        case "v":
            _params.x = 0;
            return {funcType: funcType, params: _params};
        case "a":
            _params.x = 0;
            _params.v = 0;
            return {funcType: funcType, params: _params};
    }
    return;
}

function getCorrectFunction(questionFunc: any, usedFunc?: any) {
    let availableAxises = axisIndex.slice();
    availableAxises.deleteItem(questionFunc.funcType);
    if (usedFunc) availableAxises.deleteItem(usedFunc.funcType);
    let _params = JSON.parse(JSON.stringify(questionFunc.params));

    let pickedAxis = availableAxises.getRandom();
    return getCorrectParams({funcType: pickedAxis, params: _params});
}

function getCorrectParams(pickedFunc: any) {
    let axeses = Object.keys(pickedFunc.params);
    let params = pickedFunc.params;

    if (axeses.indexOf("x") == -1 && pickedFunc.funcType == "x") {
        do params.x = getRandomFromBound(X);
        while (params.x == 0);
    }
    if (axeses.indexOf("v") == -1 && (pickedFunc.funcType == "x" || pickedFunc.funcType == "v")) {
        do params.v = getRandomFromBound(X);
        while (params.v == 0);
    }
    return pickedFunc;
}

function getWrongFunction(questionFunc: any) {
    let availableAxises = axisIndex.slice();
    availableAxises.deleteItem(questionFunc.funcType);
    let _params = JSON.parse(JSON.stringify(questionFunc.params));

    let pickedAxis = availableAxises.getRandom();
    return getWrongParams({funcType: pickedAxis, params: _params});
}

function getWrongParams(pickedFunc: any) {
    let params = pickedFunc.params;

    let a = null;
    let b = null;
    let c = null;

    if (params.a == 0) params.a = Math.round(Math.random()) ? 1 : -1;
    if (params.v == 0) params.v = Math.round(Math.random()) ? 1 : -1;
    if (params.x == 0) params.x = Math.round(Math.random()) ? 1 : -1;

    params.a = Math.abs(getRandomFromBound(A)) * Math.sign(params.a);
    params.v = Math.abs(getRandomFromBound(V)) * Math.sign(params.v);
    params.x = Math.abs(getRandomFromBound(X)) * Math.sign(params.x);

    switch (pickedFunc.funcType) {
        case "x":
            if (Math.round(Math.random())) {
                a = params.v;
                if (Math.round(Math.random())) {
                    b = params.a;
                    c = params.x;
                }
                else {
                    b = params.x;
                    c = params.a;
                }
            }
            else {
                a = params.a;
                if (Math.round(Math.random())) {
                    b = params.v;
                    c = params.x;
                }
                else {
                    b = params.x;
                    c = params.v;
                }
            }
            a = Math.round(Math.random()) ? -a : 0;
            if (Math.round(Math.random()))
                b = Math.round(Math.random()) ? -b : 0;
            if (Math.round(Math.random()))
                c = Math.round(Math.random()) ? -c : 0;
            break;
        case "v":
            if (Math.round(Math.random())) {
                a = params.v;
                b = params.a;
            }
            else {
                a = params.a;
                b = params.v;
            }
            a = Math.round(Math.random()) ? -a : 0;
            if (Math.round(Math.random()))
                b = Math.round(Math.random()) ? -b : 0;
            break;
        case "a":
            params.a = Math.round(Math.random()) ? -params.a : 0;
            break;
    }
    return pickedFunc;
}

// exports.getTestNew = functions.region("europe-west1").https.onRequest((request, resp) => {
exports.getTestNew = functions.region("europe-west1").https.onCall((data, context) => {

    let testsList = {tests: Array<any>()};

    testsList.tests[0] = getG2GtestNew(0, 1);
    testsList.tests[1] = getG2GtestNew(1, 1);
    testsList.tests[2] = getG2GtestNew(2, 1);
    testsList.tests[3] = getG2GtestNew(3, 1);

    testsList.tests[4] = getG2GtestNew(4, 2);
    testsList.tests[5] = getG2GtestNew(5, 2);
    testsList.tests[6] = getG2GtestNew(6, 2);
    testsList.tests[7] = getG2GtestNew(7, 2);

    // resp.send( JSON.stringify(testsList));
    return JSON.stringify(testsList)
});


