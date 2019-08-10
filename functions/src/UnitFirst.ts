import {FunctionObj} from './FunctionObj'
import {Config} from "./Config";
import {Utils} from "./Util";
import {FunctionBuilder} from './FunctionBuilder'

export class UnitFirst {

    static getG2Gtest(test_id: number, correctAnswersCount: number) {
        const count = Config.answerCount,
            answers = Array<any>(),
            functionBuilder = new FunctionBuilder();

        let question = {
            graph: [functionBuilder.getQuestionFunction()],
            correctIDs: Array<Number>()
        };

        functionBuilder.disableUseAvailableAxises();
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
                });

        return {
            type: correctAnswersCount === 1 ? 'graph2graph' : "graph2graph2",
            test_id: test_id,
            question: question,
            answers: answers.shuffle()
        };
    }

    // IncorrectAnswer = Question + IncorrectFunction - option in future
    static getG2Stest(test_id: number, chance: number) {
        const questions = Array<any>(),
            correctIDs = Array<number>(),
            answers = Array<any>(),
            answerCount = Config.answerCount,
            questionCount = Config.G2S_questionCount;

        let _chance: boolean,
            funcBuilder = new FunctionBuilder();

        funcBuilder.disableUseAvailableAxises();
        for (let i = 0; i < questionCount; ++i) {
            correctIDs.addRandomNumber(answerCount);

            questions[i] = {
                id: i,
                graph: [],
                correctIDs: [correctIDs.last()],
            };

            _chance = Utils.withChance(chance);
            if (_chance) {
                let functionLengths = [Config.defaultLength / 2, Config.defaultLength / 2],
                    complexFunc = funcBuilder.getComplexFunction(functionLengths);
                questions[i].graph.push(complexFunc[0]);
                questions[i].graph.push(complexFunc[1]);
            } else {
                funcBuilder.getQuestionFunction();
                questions[i].graph.push(funcBuilder.getCorrectFunction());
            }
        }


        let first: any,
            second: any,
            complexFunction: Array<FunctionObj>,
            text = "";
        for (let i = 0; i < answerCount; ++i) {
            _chance = Utils.withChance(chance);
            second = undefined;

            if (_chance) funcBuilder.setLength(Config.defaultLength / 2);
            else funcBuilder.setLength(0);

            if (correctIDs.contains(i)) {
                let index = correctIDs.indexOf(i);
                first = questions[index].graph[0];
                if (questions[index].graph.length === 2)
                    second = questions[index].graph[1];
            } else {
                if (_chance) {
                    complexFunction = funcBuilder.getComplexFunction([Config.defaultLength / 2, Config.defaultLength / 2]);
                    first = complexFunction[0];
                    second = complexFunction[1];
                } else
                    first = funcBuilder.getIncorrectFunction();
            }

            if (second) {
                let firstText = first.getTextDescription(false),
                    secondText = second.getTextDescription(false);
                if (firstText === secondText)
                    text = "Все время " + firstText;
                else text = "Cперва " + firstText + ", затем " + secondText;
            } else {
                text = first.getTextDescription(true);
            }

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
            type: 'graph2state',
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
        funcBuilder.setAvailableAxises(Config.axisIndexes.copy().deleteItem("a"));

        let cumsum = 0;
        for (let i = 0; i < questionCount - 1; i++) {
            cumsum += questionInterval;
            functionsLengths.push(questionInterval);
        }
        functionsLengths.push(Config.defaultLength - cumsum);

        let complexFunction = funcBuilder.getComplexFunction(functionsLengths);
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
