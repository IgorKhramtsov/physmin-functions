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





describe('Function Builder. Correct function should be correct to question, incorrect incorrect accordingly', () => {
    it('getG2Gtest.', () => {
        let builder = new FunctionBuilder(),
            questionFunc: FunctionObj,
            correctFuncArray: Array<FunctionObj>,
            incorrectFuncArray: Array<FunctionObj>,
            incorrectFunc: FunctionObj,
            correctAnswersCountArray = [1, 2],
            incorrectAnswersCount = Config.Tasks.G2G.answersCount;
        for (let i = 0; i < 100; ++i) {
            for (let correctAnswersCount of correctAnswersCountArray) {
                builder.reset();
                correctFuncArray = Array<FunctionObj>();
                incorrectFuncArray = Array<FunctionObj>();

                builder.disableAllowedAxesUsage();
                questionFunc = builder.getQuestionFunction();
                for (let j = 0; j < correctAnswersCount; ++j) {
                    correctFuncArray.push(builder.getCorrectFunction());
                    chai.expect(checkCorrectFunc(questionFunc, correctFuncArray.last())).to.be.true;
                }
                for (let j = 0; j < incorrectAnswersCount - correctAnswersCount; ++j) {
                    incorrectFunc = builder.getIncorrectFunction();

                    chai.expect(questionFunc.comparisons.equalByValueTo(incorrectFunc)).to.be.false;
                    for (let func of incorrectFuncArray)
                        chai.expect(incorrectFunc.comparisons.equalBySignTo(func)).to.be.false;
                    for (let func of correctFuncArray)
                        chai.expect(incorrectFunc.comparisons.equalByTextTo(func)).to.be.false;

                    incorrectFuncArray.push(incorrectFunc);
                }
            }
        }
    });

    it('getG2Stest.', () => {
        let builder = new FunctionBuilder(),
            questionFuncArray: Array<FunctionObj>,
            correctFuncArray: Array<FunctionObj>,
            questionCount = Config.Tasks.G2S.questionCount,
            correctAnswersCount: number,
            suspectCorrectAnwers: Array<FunctionObj>;
        for (let i = 0; i < 100; ++i) {
            builder.reset();
            builder.disableAllowedAxesUsage();
            builder.disableDuplicateText();
            questionFuncArray = Array<FunctionObj>();
            correctFuncArray = Array<FunctionObj>();
    
    
            for (let j = 0; j < questionCount; ++j) {
                questionFuncArray.push(builder.getQuestionFunction());
                correctFuncArray.push(builder.getCorrectFunction())
            }
    
    
            for (let questionFunc of questionFuncArray) {
                correctAnswersCount = 0;
                suspectCorrectAnwers = [];
    
                for (let correctFunc of correctFuncArray)
                    if (checkCorrectFunc(questionFunc, correctFunc)) {
                        suspectCorrectAnwers.push(correctFunc);
                        correctAnswersCount++;
                    }
    
                let suspect: FunctionObj;
                let suspectCount=0;
                for (let i = 0; i < suspectCorrectAnwers.length; ++i) {
                    suspect = suspectCorrectAnwers[i];
                    for (let j = 0; j < suspectCorrectAnwers.length; ++j) {
                        if(i != j){
                            if(suspect.comparisons.equalByTextTo(suspectCorrectAnwers[j])){
                                suspectCount++;
                            }
                        }
                    }
                }
    
                suspectCount /=2;
                //chai.expect(correctAnswersCount).to.be.equal(1);
                chai.expect(suspectCount).to.be.equal(0);
            }
        }
    });
    // it('getSGtest', () => {

    // });

    it("FunctionBuilder. Generated functions should not going out of bounds", () => {
        let builder = new FunctionBuilder(),
            func: FunctionObj,
            upperLimit = Config.Limits.upperLimit;
        for (let i = 0; i < 100; ++i) {
            for (let axis of ['x', 'v', 'a']) {
                builder.reset();
                builder.setAllowedAxes([axis]);

                func = builder.getQuestionFunction();
                for (const param of Object.keys(func.params).deleteItem("len"))
                    chai.expect(Math.abs(func.params[param])).to.be.lessThan(upperLimit)

                func = builder.getCorrectFunction();
                for (const param of Object.keys(func.params).deleteItem("len"))
                    chai.expect(Math.abs(func.params[param])).to.be.lessThan(upperLimit)

                func = builder.getIncorrectFunction();
                for (const param of Object.keys(func.params).deleteItem("len"))
                    chai.expect(Math.abs(func.params[param])).to.be.lessThan(upperLimit)
            }
        }
    });
});
