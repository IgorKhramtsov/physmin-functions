import {FunctionObj} from './FunctionObj'
import {Config} from "./Config";
import {Utils} from "./Util";
import {FunctionBuilder} from './FunctionBuilder'

export class UnitFirst {

    static getG2Gtest(test_id: number, correctAnswersCount: number) {
        const testType = correctAnswersCount === 1 ? 'graph2graph' : "graph2graph2",
            answersCount = Config.graph2graph_answersCount,
            answers = Array<any>(),
            builder = new FunctionBuilder();

        let question = {
            graph: [builder.getQuestionFunction()],
            correctIDs: Array<Number>()
        };

        builder.disableAllowedAxesUsage();
        for (let i = 0; i < correctAnswersCount; ++i)
            answers.push({
                graph: [builder.getCorrectFunction()],
                id: question.correctIDs.addRandomNumber(answersCount)
            })

        for (let i = 0; i < answersCount; ++i)
            if (!question.correctIDs.contains(i))
                answers.push({
                    graph: [builder.getIncorrectFunction()],
                    id: i
                });

        return {
            type: testType,
            test_id: test_id,
            question: question,
            answers: answers.shuffle()
        };
    }

    static getG2Stest(test_id: number, chance: number) {
        const testType: string = 'graph2state',
            questions = Array<any>(),
            correctIDs = Array<number>(),
            answers = Array<any>(),
            questionCount = Config.graph2state_questionCount,
            answerCount = Config.graph2state_answersCount;

        let _chance: boolean,
            builder = new FunctionBuilder(),

            first: any,
            second: any,

            index: number,
            firstText: string,
            secondText: string,
            text = "";


        for (let i = 0; i < questionCount; ++i) {
            correctIDs.addRandomNumber(answerCount);

            questions[i] = {
                id: i,
                graph: [],
                correctIDs: [correctIDs.last()],
            };

            _chance = Utils.withChance(chance);
            if (_chance) {
                builder.setAllowedAxes(Config.Axes.copy().deleteItem('a'));
                let functionLengths = [Config.defaultLength / 2, Config.defaultLength / 2],
                    complexFunc = builder.getComplexFunction(functionLengths);
                questions[i].graph.push(complexFunc[0]);
                questions[i].graph.push(complexFunc[1]);
            } else {
                builder.disableAllowedAxesUsage();
                builder.getQuestionFunction();
                questions[i].graph.push(builder.getCorrectFunction());
            }
        }

        for (let i = 0; i < answerCount; ++i) {
            _chance = Utils.withChance(chance);
            second = undefined;

            if (_chance) builder.setLength(Config.defaultLength / 2);
            else builder.setLength(0);

            index = correctIDs.indexOf(i);
            first = questions[index].graph[0];
            if (questions[index].graph.length === 2)
                second = questions[index].graph[1];

            if (second) {
                firstText = first.getTextDescription(false);
                secondText = second.getTextDescription(false);
                if (firstText === secondText)
                    text = "Все время " + firstText;
                else text = "Cперва " + firstText + ", затем " + secondText;
            } else
                text = first.getTextDescription(true);

            answers[i] = {
                text: text,
                id: i
            };
        }

        for (let i = 0; i < questions.length; ++i)
            for (let j = 0; j < answers.length; ++j)
                if (answers[j].text === answers[questions[i].correctIDs[0]].text)
                    if (correctIDs.contains(answers[j].id) && !questions[i].correctIDs.contains(answers[j].id))
                        questions[i].correctIDs.push(j);

        return {
            type: testType,
            test_id: test_id,
            title: "",
            question: questions,
            answers: answers.shuffle()
        };
    }

    static getSGtest(test_id: number, isSimple: boolean) {
        const testType = "relationSings",
            answers = Array<any>(),
            questionCount = Math.round(Utils.getRandomFromBound("sign2graph_questionCount")),
            questionInterval = Math.round(Config.defaultLength / questionCount),
            functionsLengths = Array<number>(),
            answersCount: number = isSimple ? 3 : 6;

        let builder = new FunctionBuilder(),
            complexFunction: Array<FunctionObj>,
            cumsum= 0,

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
            countDX= 0,
            globalCount = 0;


        builder.setAllowedAxes(Config.Axes.copy().deleteItem("a"));
        for (let i = 0; i < questionCount - 1; i++) {
            cumsum += questionInterval;
            functionsLengths.push(questionInterval);
        }
        functionsLengths.push(Config.defaultLength - cumsum);
        complexFunction = builder.getComplexFunction(functionsLengths);

        if (!isSimple) {
            firstIndexes = FunctionObj.getIndexes(questionCount, answersCount / 2);
            secondIndexes = FunctionObj.getIndexes(questionCount, answersCount / 2);
        } else
            firstIndexes = FunctionObj.getIndexes(questionCount, answersCount);


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
                if (letter == "S") {
                    leftValue = FunctionObj.calcFuncValueFromRange(leftCouple.left, leftCouple.right, complexFunction);
                    rightValue = FunctionObj.calcFuncValueFromRange(rightCouple.left, rightCouple.right, complexFunction);
                } else {
                    leftFunction = complexFunction[leftCouple.right];
                    rightFunction = complexFunction[rightCouple.right];

                    leftValue = leftFunction.calcFunctionValue();
                    rightValue = rightFunction.calcFunctionValue();
                }
            } else {
                leftFunction = complexFunction[leftCouple.right];
                rightFunction = complexFunction[rightCouple.right];

                leftValue = leftFunction.calcFunctionValue();
                rightValue = rightFunction.calcFunctionValue();
            }

            answers[i] = {
                id: i,
                letter: isSimple ? complexFunction[0].funcType : letter,
                leftIndexes: [indexes[globalCount][0][0], (parseInt(indexes[globalCount][0][1]) + 1)],
                rightIndexes: [indexes[globalCount][1][0], (parseInt(indexes[globalCount][1][1]) + 1)],
                correctSign: Math.sign(leftValue - rightValue),
            };

            if (!isSimple)
                if (letter === "S") countS++;
                else countDX++;
            else globalCount++;
        }

        return {
            type: testType,
            test_id: test_id,
            title: "",
            question: [{graph: complexFunction}],
            answers: answers.shuffle(),
        };
    }


    static getG2Gtest_OneAnswerGraph(test_id: number) {
        return UnitFirst.getG2Gtest(test_id, 1);
    }

    static getG2Gtest_TwoAnswerGraph(test_id: number) {
        return UnitFirst.getG2Gtest(test_id, 2);
    }

    static getG2Stest_SimpleFunctions(test_id: number) {
        return UnitFirst.getG2Stest(test_id, 0);
    }

    static getG2Stest_ComplexFunctions(test_id: number) {
        return UnitFirst.getG2Stest(test_id, 1);
    }

    static getG2Stest_MixedFunctions(test_id: number, ComplexChance: number) {
        return UnitFirst.getG2Stest(test_id, ComplexChance);
    }

    static getSGtest_SimpleAnswers(test_id: number = 9) {
        return UnitFirst.getSGtest(test_id, true);
    }

    static getSGtest_ComplexAnswers(test_id: number) {
        return UnitFirst.getSGtest(test_id, false);
    }
}
