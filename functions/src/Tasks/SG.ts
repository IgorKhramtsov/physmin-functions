import {FunctionObj} from "../Function/FunctionObj";
import {Config} from "../Config";
import {FunctionBuilder} from "../Function/FunctionBuilder";
import {Utils} from "../Util";

export function getSGtest(test_id: number, isSimple: boolean) {
    const testType = "relationSings",
        answers = Array<any>(),
        questionCount = Math.round(Utils.getRandomFromRange(Config.Tasks.S2G.questionCount[0], Config.Tasks.S2G.questionCount[1])),
        questionInterval = Math.round(Config.Limits.defaultLength / questionCount),
        functionsLengths = Array<number>(),
        answersCount: number = isSimple ? 3 : 6,
        builder = new FunctionBuilder();

    let complexFunction: Array<FunctionObj>,
        cumsum = 0,

        firstIndexes: any,
        secondIndexes: any,
        indexes: any,
        letter = "S",

        leftValue: number,
        rightValue: number,
        leftCouple: any,
        rightCouple: any,
        rightFunction: FunctionObj,
        leftFunction: FunctionObj,
        countS = 0,
        countDX = 0,
        globalCount = 0;


    builder.setAllowedAxes(Config.Axes.Set.copy().deleteItem("a"));
    for (let i = 0; i < questionCount - 1; i++) {
        cumsum += questionInterval;
        functionsLengths.push(questionInterval);
    }
    functionsLengths.push(Config.Limits.defaultLength - cumsum);
    complexFunction = builder.getComplexFunction(functionsLengths);

    if (!isSimple) {
        firstIndexes = Indexes.getIndexes(questionCount, answersCount / 2);
        secondIndexes = Indexes.getIndexes(questionCount, answersCount / 2);
    } else
        firstIndexes = Indexes.getIndexes(questionCount, answersCount);


    for (let i = 0; i < answersCount; ++i) {
        if (!isSimple) {
            letter = countS < (answersCount / 2) ? "S" : "Δ" + complexFunction[0].funcType;
            if (letter === "S") {
                indexes = firstIndexes;
                globalCount = countS;
            } else {
                indexes = secondIndexes;
                globalCount = countDX;
            }
        } else
            indexes = firstIndexes;

        leftCouple = {
            left: indexes[globalCount][0][0],
            right: indexes[globalCount][0][1],
        };
        rightCouple = {
            left: indexes[globalCount][1][0],
            right: indexes[globalCount][1][1],
        };

        if (!isSimple && letter !== null) {
            if (letter === "S") {
                leftValue = complexFunction[0].values.calcIntegralOnSegment(leftCouple.left, leftCouple.right, complexFunction);
                rightValue = complexFunction[0].values.calcIntegralOnSegment(rightCouple.left, rightCouple.right, complexFunction);
            } else {
                leftFunction = complexFunction[leftCouple.right];
                rightFunction = complexFunction[rightCouple.right];

                leftValue = leftFunction.values.calcFinalValue();
                rightValue = rightFunction.values.calcFinalValue();
            }
        } else {
            leftFunction = complexFunction[leftCouple.right];
            rightFunction = complexFunction[rightCouple.right];

            leftValue = leftFunction.values.calcFinalValue();
            rightValue = rightFunction.values.calcFinalValue();
        }

        answers[i] = {
            id: i,
            letter: isSimple ? complexFunction[0].funcType : letter,
            leftIndexes: [parseInt(indexes[globalCount][0][0]), (parseInt(indexes[globalCount][0][1]) + 1)],
            rightIndexes: [parseInt(indexes[globalCount][1][0]), (parseInt(indexes[globalCount][1][1]) + 1)],
            correctSign: Math.sign(leftValue - rightValue),
        };

        if (!isSimple)
            if (letter === "S") countS++;
            else countDX++;
        else globalCount++;
    }

    for (let func of complexFunction)
        func = func.getProcessed();

    return {
        type: testType,
        test_id: test_id,
        title: "",
        question: [{graph: complexFunction}],
        answers: answers.shuffle(),
    };
}

export let Indexes = {
    getIndexes(questionCount: number, answersCount: number): Array<Array<Array<number>>> {
        const indexes = Array<Array<Array<number>>>();

    // Returns unique couple of indices (read - points) on coordinate plane
        for (let i = 0; i < answersCount; i++)
            indexes.push(this.createNextCoupleIndexes(questionCount, indexes));

        return indexes;
    },

    createNextCoupleIndexes(questionCount: number, usedCoupleIndexes: Array<Array<Array<number>>>, recursive_count?: number): Array<Array<number>> {
        if (!recursive_count) recursive_count = 1;
        else if (recursive_count === 30) throw new Error('To much recursive calls.');

        const leftCoupleIndexes = this.createNextIndex(questionCount),
            rightCoupleIndexes = this.createNextIndex(questionCount, [leftCoupleIndexes]);
        let nextCoupleIndexes = [leftCoupleIndexes, rightCoupleIndexes];


        // Sorts indices of couple
        if (leftCoupleIndexes[0] > rightCoupleIndexes[0])
            nextCoupleIndexes = [rightCoupleIndexes, leftCoupleIndexes];
        else if (leftCoupleIndexes[0] === rightCoupleIndexes[0])
            if (leftCoupleIndexes[1] > rightCoupleIndexes[1])
                nextCoupleIndexes = [rightCoupleIndexes, leftCoupleIndexes];

        for (const coupleIndexes of usedCoupleIndexes)
            if (this.indexToString(nextCoupleIndexes[0]) === this.indexToString(coupleIndexes[0]) &&
                this.indexToString(nextCoupleIndexes[1]) === this.indexToString(coupleIndexes[1]))
                return this.createNextCoupleIndexes(questionCount, usedCoupleIndexes, ++recursive_count);

        return nextCoupleIndexes;
    },

    createNextIndex(questionCount: number, usedIndex?: Array<Array<number>>): Array<number> {
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
                    return this.createNextIndex(questionCount, usedIndex);

        return nextIndex;
    },

    indexToString(index: Array<number>): String {
        return index[0].toString() + index[1].toString();
    },
};


