import {FunctionObj} from './FunctionObj'
import {Config} from "./Config";
import {Utils} from "./Util";
import {FunctionBuilder} from './FunctionBuilder'

export class UnitFirst {

    static getG2Gtest(test_id: number, correctAnswersCount: number) {
        const count = Config.answerCount,
            answers = Array<any>(),
            functionBuilder = new FunctionBuilder();

        // Since createNextFunction is not used in this test
        // function can go above limits (ex. x: -9, x: 12.8)
        // So snap must be enables all the time
        functionBuilder.enableSnap();
        let question = {
            graph: [functionBuilder.getQuestionFunction()],
            correctIDs: Array<Number>()
        };

        for (let i = 0; i < correctAnswersCount; ++i)
            answers.push({
                graph: [functionBuilder.getCorrectFunction()],
                id: question.correctIDs.addRandomNumber(count)
            })

        for (let i = 0; i < count; ++i)
            if (!question.correctIDs.contains(i))
                answers.push({
                    graph: [functionBuilder.getIncorrectFunction()],
                    id: i
                })

        return {
            type: correctAnswersCount === 1 ? "graph2graph" : "graph2graph2",
            test_id: test_id,
            question: question,
            answers: answers.shuffle()
        };
    }

    static getG2Stest(test_id: number, chance: number) {
        const questions = Array<any>(),
            answers = Array<any>(),

            answerCount = Config.answerCount,
            questionCount = Config.G2S_questionCount,

            correctIDs = Array<number>();

        let _chance: boolean,
            funcBuilder = new FunctionBuilder();

        for (let i = 0; i < questionCount; ++i) {
            _chance = Utils.withChance(chance);
            correctIDs.addRandomNumber(questionCount);

            funcBuilder.getQuestionFunction();

            if (_chance)
                funcBuilder.setLength(Config.defaultLength / 2)
            else funcBuilder.setLength(0);

            questions[i] = {
                id: i,
                graph: [funcBuilder.getCorrectFunction()],
                correctIDs: [correctIDs.last()],
            };

            if (_chance)
                questions[i].graph.push(funcBuilder.getCorrectFunction())
        }

        let first: any,
            second: any,
            complexFunction: Array<FunctionObj>,
            text = "";
        for (let i = 0; i < answerCount; ++i) {
            _chance = Utils.withChance(chance);

            if (_chance)
                funcBuilder.setLength(Config.defaultLength / 2)
            else funcBuilder.setLength(0);

            if (correctIDs.contains(i)) {
                first = questions[i].graph[0];
                if (questions[i].graph.length === 2)
                    second = questions[i].graph[1];
            }
            else {
                if (_chance) {
                    complexFunction = funcBuilder.getComplexFunction([Config.defaultLength / 2, Config.defaultLength / 2]);
                    first = complexFunction[0];
                    second = complexFunction[1];
                } else
                    first = funcBuilder.getIncorrectFunction();
            }

            text = first.getTextDescription(true);
            if (second) {
                let firstText = first.getTextDescription(false),
                    secondText = second.getTextDescription(false);
                if (firstText === secondText)
                    text = "Все время " + firstText;
                else text = "Cперва " + firstText + ", затем " + secondText;
            }

            answers[i] = {
                text: text,
                id: i
            };
        }
        for (let i = 0; i < questions.length; ++i)
            for (let j = 0; j < answers.length; ++j)
                if (answers[j].id !== questions[i].correctIDs[0])
                    if (answers[j].text === answers[questions[i].correctIDs[0]].text)
                        questions[i].correctIDs.push(j);

        return {
            type: 'grapg2state',
            test_id: test_id,
            title: "",
            question: questions,
            answers: answers
        };
    }

    static getSGtest(test_id: number, isSimple: boolean) {
        const testType = "relationSings",
            answers = Array<any>(),
            questionCount = Math.round(Utils.getRandomFromBound("questionCount")),
            questionInterval = Math.round(Config.defaultLength / questionCount),
            functionsLengths = Array<number>();

        let funcBuilder = new FunctionBuilder();
        funcBuilder.setAvailableAxieses(Config.axisIndexes.copy().deleteItem("a"));

        let cumsum = 0;
        for (let i = 0; i < questionCount - 1; i++) {
            cumsum += questionInterval;
            functionsLengths.push(questionInterval);
        }
        functionsLengths.push(Config.defaultLength - cumsum);

        let complexFunction = funcBuilder.getComplexFunction(functionsLengths);
        // const questionsCopy: Array<FunctionObj> = complexFunction.copy(),
        const answersCount = isSimple ? 3 : 6;

        let firstIndexes: any,
            secondIndexes: any,
            indexes: any,
            letter = "S";
        if (!isSimple) {
            firstIndexes = FunctionObj.getIndexes(questionCount, answersCount / 2);
            secondIndexes = FunctionObj.getIndexes(questionCount, answersCount / 2);
        } else firstIndexes = FunctionObj.getIndexes(questionCount, answersCount);

        let leftValue, rightValue,
            leftCouple, rightCouple,
            rightFunction, leftFunction,
            countS = 0, countDX = 0, count = 0;
        for (let i = 0; i < answersCount; ++i) {
            if (!isSimple) {
                letter = countS < (answersCount / 2) ? "S" : "Δ" + complexFunction[0].funcType;
                if (letter === "S") {
                    indexes = firstIndexes;
                    count = countS;
                } else {
                    indexes = secondIndexes;
                    count = countDX;
                }
            } else indexes = firstIndexes;

            leftCouple = {
                left: indexes[count][0][0],
                right: indexes[count][0][1],
            };
            rightCouple = {
                left: indexes[count][1][0],
                right: indexes[count][1][1],
            };
            if (!isSimple && letter !== null) {
                if (letter == "S") {
                    leftValue = FunctionObj.calcFuncValueFromRange(leftCouple.left, leftCouple.right, complexFunction);
                    rightValue = FunctionObj.calcFuncValueFromRange(rightCouple.left, rightCouple.right, complexFunction);
                } else {
                    leftFunction = complexFunction[leftCouple.right];
                    rightFunction = complexFunction[rightCouple.right];

                    leftValue = leftFunction.calculateFunctionValue();
                    rightValue = rightFunction.calculateFunctionValue();
                }
            } else {
                leftFunction = complexFunction[leftCouple.right];
                rightFunction = complexFunction[rightCouple.right];

                leftValue = leftFunction.calculateFunctionValue();
                rightValue = rightFunction.calculateFunctionValue();
            }

            answers[i] = {
                id: i,
                letter: isSimple ? complexFunction[0].funcType : letter,
                leftIndex: [indexes[count][0][0], (parseInt(indexes[count][0][1]) + 1)],
                rightIndex: [indexes[count][1][0], (parseInt(indexes[count][1][1]) + 1)],
                correctSign: Math.sign(leftValue - rightValue),
            };

            if (!isSimple)
                if (letter === "S") countS++;
                else countDX++;
            else count++;
        }

        return {
            type: testType,
            test_id: test_id,
            title: "",
            question: [{graph: complexFunction}],
            answers: answers,
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
