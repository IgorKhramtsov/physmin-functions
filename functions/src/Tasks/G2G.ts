import {Config} from "../Config";
import {FunctionBuilder} from "../Function/FunctionBuilder";

export function getG2Gtest(test_id: number, correctAnswersCount: number) {
    const testType = correctAnswersCount === 1 ? 'G2G' : "G2G2",
        answersCount = Config.Tasks.G2G.answersCount,
        builder = new FunctionBuilder(),
        answers = Array<any>(),
        question = {
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
