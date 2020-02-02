import {Segments} from "../src/Tasks/RS";
import {FunctionBuilder} from "../src/Function/FunctionBuilder";
import {FunctionObj} from "../src/Function/FunctionObj";
import {Config} from "../src/Config";
import chai = require('chai');


// weak tests almost useless
describe('Minor functions', () => {
    it('createNextFunction. Should not throw any exceptions.', () => {
        let builder: any,
            funcLength = Config.Limits.defaultLength / 2;
        for (let i = 0; i < 100; ++i) {
            builder = new FunctionBuilder();
            chai.expect(() => builder.getComplexFunction([funcLength, funcLength])).to.not.throw(Error);
        }
    });

    it('getTextDescription. Should not throw any exceptions.', () => {
        let func: any,
            builder: FunctionBuilder;
        for (let i = 0; i < 100; ++i) {
            builder = new FunctionBuilder();
            func = builder.getCorrectFunction(builder.getQuestionFunction());
            chai.expect(() => func.getTextDescription(false)).to.not.throw(Error);
        }
    });

    it('snapEnd. Should not throw any exceptions.', () => {
        let builder: any;
        for (let i = 0; i < 100; i++) {
            builder = new FunctionBuilder();
            builder.setLength(Config.Limits.defaultLength / 2);
            chai.expect(() => builder.getCorrectFunction).to.not.throw(Error);
        }
    });

    it('createNextSegment. Should not throw any exceptions.', () => {
        let indexes = Array<Array<Array<number>>>(),
            questionCount = 5;
        for (let i = 0; i < 100; i++)
            chai.expect(() => Segments.createNextSegment(questionCount, indexes)).to.not.throw(Error);
    });
    it('createBoundaryPoint. Should not throw any exceptions.', () => {
        let leftCoupleIndexes: any,
            questionCount = 6;

        for (let i = 0; i < 100; i++) {
            chai.expect(() => leftCoupleIndexes = Segments.createBoundaryPoint(questionCount)).to.not.throw(Error);
            chai.expect(() => Segments.createBoundaryPoint(questionCount, [leftCoupleIndexes])).to.not.throw(Error)
        }
    });

    // it('generateParams. Generated params should not be all zeros', () => {
    //     let func: any,
    //         isAllZeros: boolean;
    //     for (let i = 0; i < 100; ++i) {
    //         func = new FunctionObj("a").generateParams();
    //         isAllZeros = func.params.x === 0 && func.params.v === 0 && func.params.a === 0;
    //         chai.expect(isAllZeros).to.be.false;
    //     }
    // });
});
