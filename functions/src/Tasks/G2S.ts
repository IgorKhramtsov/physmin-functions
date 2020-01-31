import { Config } from "../Config";
import { Utils } from "../Util";
import { FunctionBuilder } from "../Function/FunctionBuilder";
import { FunctionObj } from "../Function/FunctionObj";

export function getG2Stest(test_id: number, chance: number) {
    const testType: string = 'G2S',
        questions = Array<any>(),
        correctIDs = Array<number>(),
        answers = Array<any>(),
        builder = new FunctionBuilder(),

        questionCount = Config.Tasks.G2S.questionCount,
        answersCount = Config.Tasks.G2S.answersCount,
        length = Config.Limits.defaultLength;

    let cachedChance: boolean,
        first: FunctionObj,
        second: FunctionObj | null,

        index: number,
        firstText: string,
        secondText: string,
        text = "";

    for (let i = 0; i < questionCount; ++i) {
        correctIDs.addRandomNumber(answersCount);

        questions[i] = {
            id: i,
            graph: [],
            correctIDs: [correctIDs.last()],
        };

        cachedChance = Utils.withChance(chance);
        if (cachedChance) {
            builder.setAllowedAxes(Config.getAxesCopy(['a']));
            const complexFunc = builder.getComplexFunction([length / 2, length / 2]);
            questions[i].graph.push(complexFunc[0].getProcessed());
            questions[i].graph.push(complexFunc[1].getProcessed());
        } else {
            builder.disableAllowedAxesUsage();
            questions[i].graph.push(builder.getCorrectFunction(builder.getQuestionObj()).getProcessed());
        }
    }

    builder.disableDuplicateText();
    for (let i = 0; i < answersCount; ++i) {
        cachedChance = Utils.withChance(chance);
        second = null;

        if (cachedChance) builder.setLength(length / 2);
        else builder.setLength(0);

        index = correctIDs.indexOf(i);
        first = questions[index].graph[0];
        if (questions[index].graph.length === 2)
            second = questions[index].graph[1];

        if (second) {
            firstText = first.getTextDescription();
            secondText = second.getTextDescription();
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

    // for (let i = 0; i < questions.length; ++i)
    //     for (let j = 0; j < answers.length; ++j)
    //         if (answers[j].text === answers[questions[i].correctIDs[0]].text)
    //             if (correctIDs.contains(answers[j].id) && !questions[i].correctIDs.contains(answers[j].id))
    //                 questions[i].correctIDs.push(j);

    return {
        type: testType,
        test_id: test_id,
        title: "",
        question: questions,
        answers: answers.shuffle()
    };
}
