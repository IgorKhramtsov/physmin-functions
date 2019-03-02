import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// import Firestore = admin.firestore.Firestore;
// import {settings} from "cluster";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

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

const correctAnswers = [['graph_x_6','graph_v_7','graph_a_3'],
    ['graph_x_5','graph_v_5','graph_a_2'],
    ['graph_x_2','graph_x_1','graph_v_1','graph_a_1'],
    ['graph_x_3','graph_v_3','graph_a_1'],
    ['graph_x_7','graph_v_4','graph_a_2'],
    ['graph_x_8','graph_v_6','graph_a_3'],
    ['graph_x_4','graph_v_2','graph_a_1']];

// const answersTotalCount = {
//     graph_x: 8,
//     graph_v: 7,
//     graph_a: 3
// };

exports.createAnswerMap = functions.https.onRequest(async (req, res) => {
    let answersMap: Map<string, Array<string>> = new Map();

    correctAnswers.forEach((row) => {
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
   await db.collection('test_1.1').doc('answer_map').set(data).then(ref => {
       res.status(200).send("Answer map added to firestore database!")
   })
});

exports.getTest = functions.region("europe-west1").https.onCall(async (data, context) => {
    /*
    // Message text passed from the client.
    const text = data.text;
    // Authentication / user information is automatically added to the request.
    const uid = context.auth.uid;
    const name = context.auth.token.name || null;
    const picture = context.auth.token.picture || null;
    const email = context.auth.token.email || null;
    */
    let count = 8;
    if(data != undefined && data.count != undefined)
        count = data.count;


    let test = {tests: [ {
            type: "graph2graph",
            test_id: 0,
            title: "",
            question: {
                picture: "",
                "correct_id": 0
            },
            answers: Array<Object>()
        }]};

    return await db.collection('test_1.1').doc('answer_map').get().then(doc => {
        const answer_map = doc.data() as any;
        const answer_keys = Object.keys(answer_map);
        const usedPics = Array<string>();

        const corr_key = answer_keys.getRandom();
        const correct_answers = answer_map[corr_key] as Array<string>;
        answer_keys.splice(answer_keys.indexOf(corr_key), 1); // Delete choosed key from array of keys

        test.tests[0].question.picture = correct_answers[correct_answers.length.getRandom()];
        usedPics.push(test.tests[0].question.picture );
        const corr_id = count.getRandom();
        test.tests[0].question.correct_id = corr_id;

        let pic: string;
        do pic = correct_answers[correct_answers.length.getRandom()];
        while (usedPics.indexOf(pic) != -1);
        usedPics.push(pic);
        test.tests[0].answers[corr_id] = {
            id: corr_id,
            picture_name: pic
        };

        let cache_answer_arr;
        for (let i = 0; i < count; i++) {
            if (i != corr_id) {
                do {
                    cache_answer_arr = answer_map[answer_keys.getRandom()];
                    pic = cache_answer_arr[cache_answer_arr.length.getRandom()];
                } while (usedPics.indexOf(pic) != -1 || correct_answers.indexOf(pic) != -1);
                usedPics.push(pic);

                test.tests[0].answers[i] = {id: i, picture_name: pic};
            }
        }
        return JSON.stringify(test);
    });
});

// exports.getTest = functions.region("europe-west1").https.onRequest(async (req, res) => {
//     let count = 8;
//     if(req.query.answers_count != undefined)
//         count = req.query.answers_count;
//
//     let test = {tests: [ {
//             type: "graph2graph",
//             test_id: 0,
//             title: "",
//             question: {
//                 picture: "",
//                 "correct_id": 0
//             },
//             answers: Array<Object>()
//         }]};
//
//     await db.collection('test_1.1').doc('answer_map').get().then(doc => {
//         console.log("got answer map");
//         const answer_map = doc.data() as any;
//         const answer_keys = Object.keys(answer_map);
//         const usedPics = Array<string>();
//
//         const corr_key = answer_keys.getRandom();
//         const correct_answers = answer_map[corr_key];
//         answer_keys.splice(answer_keys.indexOf(corr_key), 1); // Delete choosed key from array of keys
//
//         test.tests[0].question.picture = correct_answers[correct_answers.length.getRandom()];
//         usedPics.push(test.tests[0].question.picture );
//         const corr_id = count.getRandom();
//         test.tests[0].question.correct_id = corr_id;
//         console.log("corr_id: "+corr_id);
//
//         let pic: string;
//         do pic = correct_answers[correct_answers.length.getRandom()];
//         while (usedPics.indexOf(pic) != -1);
//         usedPics.push(pic);
//         test.tests[0].answers[corr_id] = {
//             id: corr_id,
//             picture_name: pic
//         };
//
//         let cache_answer_arr;
//         for(let i = 0; i < count; i++) {
//             console.log("for iteration: " + i);
//             if (i != corr_id) {
//                 do {
//                     // console.log("second do started");
//                     cache_answer_arr = answer_map[answer_keys.getRandom()];
//                     pic = cache_answer_arr[cache_answer_arr.length.getRandom()];
//                 } while (usedPics.indexOf(pic) != -1);
//                 usedPics.push(pic);
//
//                 test.tests[0].answers[i] = {id: i, picture_name: pic};
//             }
//         }
//         console.log("huy");
//         res.status(200).send(test);
//     });
// });

// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
