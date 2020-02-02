import {FunctionBuilder} from "../src/Function/FunctionBuilder";
import {FunctionObj} from "../src/Function/FunctionObj";
import {Config} from "../src/Config";
import chai = require('chai');

function checkCorrectFunc(questionFunc: FunctionObj, correctFunc: FunctionObj) {
    let forCompare: FunctionObj,
        correctFuncType = correctFunc.funcType;
    switch (questionFunc.funcType) {
        case 'x':
            if (correctFuncType === 'v') {
                forCompare = new FunctionObj(questionFunc.funcType, correctFunc.copyParams());
                forCompare.params.x = questionFunc.params.x;
                return forCompare.comparisons.equalByValueTo(questionFunc);
            } else if (correctFuncType === 'a') {
                forCompare = new FunctionObj(questionFunc.funcType, correctFunc.copyParams());
                forCompare.params.x = questionFunc.params.x;
                forCompare.params.v = questionFunc.params.v;
                return forCompare.comparisons.equalByValueTo(questionFunc);
            }
            break;
        case 'v':
            if (correctFuncType === 'x') {
                forCompare = new FunctionObj(questionFunc.funcType, correctFunc.copyParams()).clearParams();
                return forCompare.comparisons.equalByValueTo(questionFunc);
            } else if (correctFuncType === 'a') {
                forCompare = new FunctionObj(questionFunc.funcType, correctFunc.copyParams());
                forCompare.params.v = questionFunc.params.v;
                return forCompare.comparisons.equalByValueTo(questionFunc);
            }
            break;

        case 'a':
            if (correctFuncType === 'x' || correctFuncType === 'v') {
                forCompare = new FunctionObj(questionFunc.funcType, correctFunc.copyParams()).clearParams();
                return forCompare.comparisons.equalByValueTo(questionFunc);
            }
            break;
    }
    return false;
}





describe('Function Builder.', () => {
    it('getG2Gtest. Correct function should be correct to question, incorrect incorrect accordingly', () => {
        let builder = new FunctionBuilder(),
            questionObj: FunctionObj,
            correctFuncArray: Array<FunctionObj>,
            incorrectFuncArray: Array<FunctionObj>,
            correctAnswersCountArray = [1, 2],
            incorrectAnswersCount = Config.Tasks.G2G.answersCount;
        for (let i = 0; i < 100; ++i) {
            for (let correctAnswersCount of correctAnswersCountArray) {
                builder.reset();
                correctFuncArray = Array<FunctionObj>();
                incorrectFuncArray = Array<FunctionObj>();

                builder.disableAllowedAxes();
                questionObj = builder.getQuestionFunction();
                for (let j = 0; j < correctAnswersCount; ++j) {
                    correctFuncArray.push(builder.getCorrectFunction(questionObj));
                    chai.expect(checkCorrectFunc(questionObj, correctFuncArray.last())).to.be.true;
                }
                for (let j = 0; j < incorrectAnswersCount - correctAnswersCount; ++j) {
                    incorrectFuncArray.push(builder.getIncorrectFunction(questionObj));
                    chai.expect(checkCorrectFunc(questionObj, incorrectFuncArray.last())).to.be.false;
                }
            }
        }
    });

    // it('getS2Gtest. Correct function should be correct to question, incorrect incorrect accordingly', () => {
    //     let builder = new FunctionBuilder(),
    //         questionFuncArray: Array<QuestionObj>,
    //         correctFuncArray: Array<FunctionObj>,
    //         questionCount = Config.Tasks.RS.questionCount,
    //         correctAnswersCount: number,
    //         suspectCorrectAnwers: Array<FunctionObj>;
    //     for (let i = 0; i < 100; ++i) {
    //         builder.reset();
    //         builder.disableAllowedAxes();
    //         //builder.disableDuplicateText();
    //         questionFuncArray = Array<QuestionObj>();
    //         correctFuncArray = Array<FunctionObj>();
    
    
    //         for (let j = 0; j < questionCount; ++j) {
    //             questionFuncArray.push(builder.getQuestionObj());
    //             correctFuncArray.push(builder.getCorrectFunction(questionFuncArray.last()))
    //         }
    
    
    //         for (let questionFunc of questionFuncArray) {
    //             correctAnswersCount = 0;
    //             suspectCorrectAnwers = [];
    
    //             for (let correctFunc of correctFuncArray)
    //                 if (checkCorrectFunc(questionFunc.func, correctFunc)) {
    //                     suspectCorrectAnwers.push(correctFunc);
    //                     correctAnswersCount++;
    //                 }
    
    //             let suspect: FunctionObj;
    //             let suspectCount=0;
    //             for (let i = 0; i < suspectCorrectAnwers.length; ++i) {
    //                 suspect = suspectCorrectAnwers[i];
    //                 for (let j = 0; j < suspectCorrectAnwers.length; ++j) {
    //                     if(i != j){
    //                         if(suspect.comparisons.equalByTextTo(suspectCorrectAnwers[j])){
    //                             suspectCount++;
    //                         }
    //                     }
    //                 }
    //             }
    
    //             suspectCount /=2;
    //             //chai.expect(correctAnswersCount).to.be.equal(1);
    //             chai.expect(suspectCount).to.be.equal(0);
    //         }
    //     }
    // });
    // it('getRStest', () => {

    // });

    it("Generated functions should not going out of bounds", () => {
        let builder = new FunctionBuilder(),
            question: FunctionObj,
            func: FunctionObj,
            upperLimit = Config.Limits.upperLimit;
        for (let i = 0; i < 100; ++i) {
            for (let axis of ['x', 'v', 'a']) {
                builder.reset();

                question = builder.getQuestionFunction([axis]);
                for (const param of Object.keys(question.params).deleteItem("len"))
                    chai.expect(Math.abs(question.params[param])).to.be.lessThan(upperLimit)

                func = builder.getCorrectFunction(question);
                for (const param of Object.keys(func.params).deleteItem("len"))
                    chai.expect(Math.abs(func.params[param])).to.be.lessThan(upperLimit)

                func = builder.getIncorrectFunction(question);
                for (const param of Object.keys(func.params).deleteItem("len"))
                    chai.expect(Math.abs(func.params[param])).to.be.lessThan(upperLimit)
            }
        }
    });
});
