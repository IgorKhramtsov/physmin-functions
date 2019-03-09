import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
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
    }
}
    Number.prototype.toFloor = function (this: number): number {
        return Math.floor(this);
    };
    Number.prototype.getRandom = function (this: number): number {
        return Math.floor(Math.random() * this);
    };
    Array.prototype.getRandom = function<T> (this: T[]):T {
        return this[this.length.getRandom()];
    };


const app = admin.initializeApp();
const db = admin.firestore(app);

const correctAnswers_1_1 = [['graph_x_6','graph_v_7','graph_a_3'],
    ['graph_x_5','graph_v_5','graph_a_2'],
    ['graph_x_2','graph_x_1','graph_v_1','graph_a_1'],
    ['graph_x_3','graph_v_3','graph_a_1'],
    ['graph_x_7','graph_v_4','graph_a_2'],
    ['graph_x_8','graph_v_6','graph_a_3'],
    ['graph_x_4','graph_v_2','graph_a_1']];

exports.createAnswerMap = functions.https.onRequest(async (req, res) => {
    let answersMap: Map<string, Array<string>> = new Map();

    correctAnswers_1_1.forEach((row) => {
        row.forEach((col) => {
            let list: Array<string> = [];
            if(answersMap.has(col))
                list = answersMap.get(col)!;

            row.forEach((_col) => {
                if(_col == col)
                    return;
                if(list.indexOf(_col) == -1)
                    list.push(_col)
            });
            answersMap.set(col, list);

        });
    });
    let data = {} as any;

    answersMap.forEach((a,b) => {
        data[b] = a;
    });
   await db.collection('answer_map').doc('test_1.1').set(data).then(ref => {
       res.status(200).send("Answer map added to firestore database!")
   })
});
exports.getTest = functions.region("europe-west1").https.onCall(async (data, context) => {
    let count = 8;
    if(data != undefined && data.count != undefined)
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

//
// exports.getTestNew = functions.region("europe-west1").https.onCall((data, context) => {
//
//     let functions = [
//         {
//             from: [0, 5],
//             to: [5, 0],
//             type: "arc"
//         },
//         {
//             from: [5, 0],
//             to: [6, 2],
//             type: "line"
//         },
//     ];
//
//     let test = {
//
//     } as any;
// });