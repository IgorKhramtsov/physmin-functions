import { Config } from "../Config";
import { Utils } from "../Util";
import { FunctionBuilder } from "../Function/FunctionBuilder";
import { FunctionObj, Graph } from "../Function/FunctionObj";
import { S2GConfig } from "../api/types";

type Question = {
    id: number,
    graph: Graph,
    correctIDs: number[]
}
type Answer = {
    text: string,
    id: number
}

export function getS2Gtest(taskID: number, config: S2GConfig = Config.Tasks.S2G) {
    const
        questions = Array<Question>(),
        correctIDs = Array<number>(),
        answers = Array<Answer>(),
        builder = new FunctionBuilder(),

        graphsCount = config.answersCount,
        length = Config.Limits.defaultLength;

    let cachedChance: boolean,
        first: FunctionObj,
        second: FunctionObj | null,

        index: number,
        firstText: string,
        secondText: string,
        text = "";

    builder.setAllowedAxes(config.axes)

    for (let i = 0; i < graphsCount; ++i) {
        correctIDs.pushRandomNumber(graphsCount); // Array used to disable duplicates

        questions[i] = {
            id: i,
            graph: [],
            correctIDs: [correctIDs.last()],
        };

        cachedChance = Utils.withChance(config.doubleGraphChance);
        if (cachedChance) {
            const complexFunc = builder.getComplexFunction([length / 2, length / 2]);
            questions[i].graph = [complexFunc[0].getProcessed(), complexFunc[1].getProcessed()]

            firstText = complexFunc[0].getTextDescription();
            secondText = complexFunc[1].getTextDescription();
            if (firstText === secondText)
                text = "Все время " + firstText;
            else
                text = "Cперва " + firstText + ", затем " + secondText;
        } else {
            const funcObj = builder.getQuestionFunction()
            questions[i].graph = [funcObj.getProcessed()];
            text = funcObj.getTextDescription(true);
        }

        answers[i] = {
            text: text,
            id: correctIDs.last()
        };
    }

    return {
        type: "S2G",
        taskID: taskID,
        question: questions,
        answers: answers.shuffle()
    };
}
