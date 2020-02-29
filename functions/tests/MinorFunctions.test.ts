import {Segments} from "../src/Tasks/RS";
import {FunctionBuilder} from "../src/Function/FunctionBuilder";
import {FunctionObj} from "../src/Function/FunctionObj";
import {Config} from "../src/Config";
import chai = require('chai');
import {createAnswers} from "../src/Tasks/RS";

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

    it('Segments.getSegments. Should not throw any exceptions.', () => {
        let questionCount = Config.Tasks.RS.segmentsCount,
            answersCountSimple = 3,
            answersCountComplex = 4;
        for (let i = 0; i < 100; i++){
            chai.expect(() => Segments.getSegments(questionCount[0], answersCountSimple)).to.not.throw(Error);
            chai.expect(() => Segments.getSegments(questionCount[0], answersCountComplex)).to.not.throw(Error);
            chai.expect(() => Segments.getSegments(questionCount[1], answersCountSimple)).to.not.throw(Error);
            chai.expect(() => Segments.getSegments(questionCount[1], answersCountComplex)).to.not.throw(Error)
        }
    });
    it('Segments.createNextSegment. Should not throw any exceptions.', () => {
        let indexes = Array<Array<Array<number>>>(),
            questionCount = 5;
        for (let i = 0; i < 100; i++)
            chai.expect(() => Segments.createNextSegment(questionCount, indexes)).to.not.throw(Error);
    });
    it('Segments.createBoundaryPoints. Should not throw any exceptions.', () => {
        let leftCoupleIndexes: any,
            questionCount = 6;

        for (let i = 0; i < 100; i++) {
            chai.expect(() => leftCoupleIndexes = Segments.createBoundaryPoints(questionCount)).to.not.throw(Error);
            chai.expect(() => Segments.createBoundaryPoints(questionCount, [leftCoupleIndexes])).to.not.throw(Error)
        }
    });

    it("RS. createAnswers. Should not throw any exceptions.", ()=>{
        let builder = new FunctionBuilder(),
            questionCount = Config.Tasks.RS.segmentsCount;
        for(let i =0; i< 100; ++i){
            builder.reset();
            builder.setAllowedAxes(Config.getAxesCopy(['a']));
            checkCreateAnswers(questionCount[0], true);

            builder.reset();
            builder.setAllowedAxes(Config.getAxesCopy(['a']));
            checkCreateAnswers(questionCount[0], false);

            builder.reset();
            builder.setAllowedAxes(Config.getAxesCopy(['a']));
            checkCreateAnswers(questionCount[1], true);

            builder.reset();
            builder.setAllowedAxes(Config.getAxesCopy(['a']));
            checkCreateAnswers(questionCount[1], false);
        }

        function checkCreateAnswers(questionCount: number, isSimple: boolean){
            const questionInterval = Math.round(Config.Limits.defaultLength / questionCount);

            let interval = Array<number>(),
                segments_1: any,
                segments_2: any;
            for (let i = 0; i < questionCount; ++i)
                interval.push(questionInterval);

            const complexFunc = builder.getComplexFunction(interval);

            if (!isSimple) {
                const half = 6 / 2;
                segments_1 = Segments.getSegments(questionCount, half);
                chai.expect(() => createAnswers(complexFunc, segments_1, "S")).to.not.throw(Error);

                segments_2= Segments.getSegments(questionCount, half);
                chai.expect(() => createAnswers(complexFunc, segments_2, "Δ" + complexFunc[0].funcType)).to.not.throw(Error);

            } else {
                segments_1 = Segments.getSegments(questionCount, 3);
                chai.expect(() => createAnswers(complexFunc, segments_1, "Δ" + complexFunc[0].funcType)).to.not.throw(Error);
            }

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
