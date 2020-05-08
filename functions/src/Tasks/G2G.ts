import { Config } from "../Config";
import { FunctionBuilder } from "../Function/FunctionBuilder";
import { G2GConfig } from './../api/types'
import { Graph } from "../Function/FunctionObj";
import { Task } from "./types";

type Answer = {
    graph: Graph,
    id: number
}

export function getG2Gtask(taskID: number, config: G2GConfig = Config.Tasks.G2G) {
    const
        answersCount = config.answersCount,
        correctAnswersCount = config.correctAnswersCount,
        answers = Array<Answer>(),
        correctIDs = Array<number>(),
        builder = new FunctionBuilder()

    builder.setAllowedAxes(config.questionAxes)
    const questionObj = builder.getQuestionFunction()
    builder.setAllowedAxes(config.answersAxes)
    for (let i = 0; i < correctAnswersCount; ++i)
        answers.push({
            graph: [builder.getCorrectFunction(questionObj).getProcessed()],
            id: correctIDs.pushRandomNumber(answersCount)
        })

    for (let i = 0; i < answersCount; ++i)
        if (!correctIDs.contains(i))
            answers.push({
                graph: [builder.getIncorrectFunction(questionObj).getProcessed()],
                id: i
            });


    return {
        type: 'G2G',
        taskID: taskID,
        question: {
            id: 0,
            graph: [questionObj.getProcessed()],
            correctIDs: correctIDs
        },
        answers: answers.shuffle(),
        correctAnswersCount: correctAnswersCount
    } as Task;
}
