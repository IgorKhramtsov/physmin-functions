import {Config} from "../Config";
import {Utils} from "../Util";
import {FunctionBuilder} from "../Function/FunctionBuilder";

export function getG2Stest(test_id: number, chance: number) {
    const testType: string = 'G2S',
        questions = Array<any>(),
        correctIDs = Array<number>(),
        answers = Array<any>(),
        builder = new FunctionBuilder(),

        questionCount = Config.Tasks.G2S.questionCount,
        answersCount = Config.Tasks.G2G.answersCount,
        length = Config.Limits.defaultLength;

    let _chance: boolean,
        first: any,
        second: any,

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

        _chance = Utils.withChance(chance);
        if (_chance) {
            builder.setAllowedAxes(Config.Axes.Set.copy().deleteItem('a'));
            const functionLengths = [length / 2, length / 2],
                complexFunc = builder.getComplexFunction(functionLengths);
            questions[i].graph.push(complexFunc[0]);
            questions[i].graph.push(complexFunc[1]);
        } else {
            builder.disableAllowedAxesUsage();
            builder.getQuestionFunction();
            questions[i].graph.push(builder.getCorrectFunction());
        }
    }

    builder.disableDuplicateText();
    for (let i = 0; i < answersCount; ++i) {
        _chance = Utils.withChance(chance);
        second = undefined;

        if (_chance) builder.setLength(length / 2);
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
