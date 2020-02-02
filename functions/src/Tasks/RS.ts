import {FunctionObj} from "../Function/FunctionObj";
import {Config} from "../Config";
import {FunctionBuilder} from "../Function/FunctionBuilder";
import {Utils} from "../Util";


export let Segments = {
    getSegments(questionCount: number, answersCount: number): Array<Array<Array<number>>> {
        const segments = Array<Array<Array<number>>>();

        // Returns unique couple of indices (read - points) on coordinate plane
        for (let i = 0; i < answersCount; i++)
            segments.push(Segments.createNextSegment(questionCount, segments));

        return segments;
    },

    createNextSegment(questionCount: number, usedCoupleIndexes: Array<Array<Array<number>>>, recursive_count?: number): Array<Array<number>> {
        if (!recursive_count) recursive_count = 1;
        else if (recursive_count === 30) throw new Error('To much recursive calls.');

        const leftCoupleIndexes = Segments.createBoundaryPoint(questionCount),
            rightCoupleIndexes = Segments.createBoundaryPoint(questionCount, [leftCoupleIndexes]);
        let nextCoupleIndexes = [leftCoupleIndexes, rightCoupleIndexes];


        // Sorts indices of the couple
        if (leftCoupleIndexes[0] > rightCoupleIndexes[0])
            nextCoupleIndexes = [rightCoupleIndexes, leftCoupleIndexes];
        else if (leftCoupleIndexes[0] === rightCoupleIndexes[0])
            if (leftCoupleIndexes[1] > rightCoupleIndexes[1])
                nextCoupleIndexes = [rightCoupleIndexes, leftCoupleIndexes];

        for (const coupleIndexes of usedCoupleIndexes)
            if (Segments.indexToString(nextCoupleIndexes[0]) === Segments.indexToString(coupleIndexes[0]) &&
                Segments.indexToString(nextCoupleIndexes[1]) === Segments.indexToString(coupleIndexes[1]))
                return Segments.createNextSegment(questionCount, usedCoupleIndexes, ++recursive_count);

        return nextCoupleIndexes;
    },

    createBoundaryPoint(questionCount: number, usedIndex?: Array<Array<number>>): Array<number> {
        let leftIndex,
            rightIndex,
            nextIndex: Array<number>,
            iter_count = 0;


        rightIndex = questionCount.getRandom();
        for (iter_count = 0; iter_count < 30 && (leftIndex === rightIndex || leftIndex === undefined); ++iter_count)
            leftIndex = questionCount.getRandom();

        if (leftIndex === rightIndex || leftIndex === undefined) throw new Error('To many cycle iterations.');

        nextIndex = [leftIndex, rightIndex].sort();
        if (usedIndex)
            for (const index of usedIndex)
                if (index[0] === nextIndex[0] && index[1] === nextIndex[1])
                    return Segments.createBoundaryPoint(questionCount, usedIndex);

        return nextIndex;
    },

    indexToString(index: Array<number>): String {
        return index[0].toString() + index[1].toString();
    },
};

function createAnswers(complexFunc: Array<FunctionObj>, segments: Array<Array<Array<number>>>, letter: string) {
    let leftSegment: any,
        rightSegment: any,

        leftValue = 0,
        rightValue = 0,

        answers = Array<any>();

    for (let i = 0; i < segments.length; ++i) {
        leftSegment = {
            start: segments[i][0][0],
            end: segments[i][0][1],
        };
        rightSegment = {
            start: segments[i][1][0],
            end: segments[i][1][1],
        };

        leftValue = calcTargetFunction(complexFunc, leftSegment, letter);
        rightValue = calcTargetFunction(complexFunc, rightSegment, letter);

        answers[i] = {
            id: i,
            letter: letter,
            leftSegment: [leftSegment.start, leftSegment.end + 1],
            rightSegment: [rightSegment.start, rightSegment.end + 1],
            correctSign: Math.sign(leftValue - rightValue),
        };
    }

    return answers
}

function calcTargetFunction(complexFunc: Array<FunctionObj>, segment: any, letter: string) {
    let value = 0;
    if (letter === "S")
        value = complexFunc[0].values.calcIntegralOnSegment(segment.start, segment.end, complexFunc);
    else
        value = complexFunc[segment.end].values.calcIntegral();
    return value
}

export function getRStest(test_id: number, isSimple: boolean) {
    const testType = "relationSings",

        taskConfig = Config.Tasks.RS,
        questionCount = Math.round(Utils.getRandomFromRange(taskConfig.questionCount[0], taskConfig.questionCount[1])),
        questionInterval = Math.round(Config.Limits.defaultLength / questionCount),
        functionsLengths = Array<number>(),
        answersCount: number = isSimple ? taskConfig.simple.answersCount : taskConfig.complex.answersCount,
        builder = new FunctionBuilder();

    let complexFunction: Array<FunctionObj>,
        answers = Array<any>(),

        firstSegments: any,
        secondSegments: any;


    builder.setAllowedAxes(Config.Axes.set.copy().deleteItem("a"));
    for (let i = 0; i < questionCount; i++)
        functionsLengths.push(questionInterval);
    complexFunction = builder.getComplexFunction(functionsLengths);

    let firstAnswers = Array<FunctionObj>(),
        secondAnswers = Array<FunctionObj>();

    if (!isSimple) {
        const half = answersCount / 2;
        firstSegments = Segments.getSegments(questionCount, half);
        firstAnswers = createAnswers(complexFunction, firstSegments, "S");

        secondSegments = Segments.getSegments(questionCount, half);
        secondAnswers = createAnswers(complexFunction, secondSegments, "Δ" + complexFunction[0].funcType);

        answers = firstAnswers.concat(secondAnswers);
    } else {
        firstSegments = Segments.getSegments(questionCount, answersCount);
        answers = createAnswers(complexFunction, firstSegments, "Δ" + complexFunction[0].funcType);
    }


    const processedQuestion = Array<FunctionObj>();
    for (const func of complexFunction)
        processedQuestion.push(func.getProcessed());

    return {
        type: testType,
        test_id: test_id,
        title: "",
        question: [{graph: processedQuestion}],
        answers: answers.shuffle(),
    };
}


//
// export function getRStest(test_id: number, isSimple: boolean) {
//     const testType = "relationSings",
//         answers = Array<any>(),
//         taskConfig = Config.Tasks.RS,
//         questionCount = Math.round(Utils.getRandomFromRange(taskConfig.questionCount[0], taskConfig.questionCount[1])),
//         questionInterval = Math.round(Config.Limits.defaultLength / questionCount),
//         functionsLengths = Array<number>(),
//         answersCount: number = isSimple ? taskConfig.simple.answersCount : taskConfig.complex.answersCount,
//         builder = new FunctionBuilder();
//
//     let complexFunction: Array<FunctionObj>,
//
//         firstIndexes: any,
//         secondIndexes: any,
//         indexes: any,
//         letter = "S",
//
//         leftValue: number,
//         rightValue: number,
//         leftCouple: any,
//         rightCouple: any,
//         rightFunction: FunctionObj,
//         leftFunction: FunctionObj,
//         countS = 0,
//         countDX = 0,
//         globalCount = 0;
//
//
//     builder.setAllowedAxes(Config.Axes.set.copy().deleteItem("a"));
//     for (let i = 0; i < questionCount; i++)
//         functionsLengths.push(questionInterval);
//     complexFunction = builder.getComplexFunction(functionsLengths);
//
//     if (!isSimple) {
//         firstIndexes = Segments.getSegments(questionCount, answersCount / 2);
//         secondIndexes = Segments.getSegments(questionCount, answersCount / 2);
//     } else
//         firstIndexes = Segments.getSegments(questionCount, answersCount);
//
//
//
//     // leftCouple := [a,b], where a,b - numbers
//     // rightCouple := [c,d], where c,d - numbers
//     for (let i = 0; i < answersCount; ++i) {
//         if (!isSimple) {
//             letter = countS < (answersCount / 2) ? "S" : "Δ" + complexFunction[0].funcType;
//             if (letter === "S") {
//                 indexes = firstIndexes;
//                 globalCount = countS;
//             } else {
//                 indexes = secondIndexes;
//                 globalCount = countDX;
//             }
//         } else
//             indexes = firstIndexes;
//
//         leftCouple = {
//             left: indexes[globalCount][0][0],
//             right: indexes[globalCount][0][1],
//         };
//         rightCouple = {
//             left: indexes[globalCount][1][0],
//             right: indexes[globalCount][1][1],
//         };
//
//         if (!isSimple && letter !== null && letter === "S") {
//             leftValue = complexFunction[0].values.calcIntegralOnSegment(leftCouple.left, leftCouple.right, complexFunction);
//             rightValue = complexFunction[0].values.calcIntegralOnSegment(rightCouple.left, rightCouple.right, complexFunction);
//         } else {
//             leftFunction = complexFunction[leftCouple.right];
//             rightFunction = complexFunction[rightCouple.right];
//
//             leftValue = leftFunction.values.calcIntegral();
//             rightValue = rightFunction.values.calcIntegral();
//         }
//
//         // if (!isSimple && letter !== null) {
//         //     if (letter === "S") {
//         //         leftValue = complexFunction[0].values.calcIntegralOnSegment(leftCouple.left, leftCouple.right, complexFunction);
//         //         rightValue = complexFunction[0].values.calcIntegralOnSegment(rightCouple.left, rightCouple.right, complexFunction);
//         //     } else {
//         //         leftFunction = complexFunction[leftCouple.right];
//         //         rightFunction = complexFunction[rightCouple.right];
//         //
//         //         leftValue = leftFunction.values.calcFinalValue();
//         //         rightValue = rightFunction.values.calcFinalValue();
//         //     }
//         // } else {
//         //     leftFunction = complexFunction[leftCouple.right];
//         //     rightFunction = complexFunction[rightCouple.right];
//         //
//         //     leftValue = leftFunction.values.calcFinalValue();
//         //     rightValue = rightFunction.values.calcFinalValue();
//         // }
//
//         answers[i] = {
//             id: i,
//             letter: isSimple ? complexFunction[0].funcType : letter,
//             leftIndexes: [parseInt(indexes[globalCount][0][0]), (parseInt(indexes[globalCount][0][1]) + 1)],
//             rightIndexes: [parseInt(indexes[globalCount][1][0]), (parseInt(indexes[globalCount][1][1]) + 1)],
//             correctSign: Math.sign(leftValue - rightValue),
//         };
//
//         if (!isSimple)
//             if (letter === "S") countS++;
//             else countDX++;
//         else globalCount++;
//     }
//
//     const processedQuestion = Array<FunctionObj>();
//     for (const func of complexFunction)
//         processedQuestion.push(func.getProcessed());
//
//     return {
//         type: testType,
//         test_id: test_id,
//         title: "",
//         question: [{graph: processedQuestion}],
//         answers: answers.shuffle(),
//     };
// }
//
//

