import { Utils } from "./Util";
import { S2GConfig, G2GConfig, RSConfig } from "./api/types";

export const Config = {

    Axes: {
        set: [
            'x', 'v', 'a'
        ],

        X: "x",
        V: "v",
        A: "a",
    },

    Bounds: {
        x: [0.1, 4],
        v: [0.1, 1],
        a: [0.15, 0.5],
    } as any,

    // zero snap threshold in random function
    Threshold: {
        x: 0.4,
        v: 0.1,
        a: 0.05
    } as any,

    Limits: {
        upperLimit: 5,      // max function value
        lowerLimit: 2,      // min function value (near of zero) doesnt used mostly, use snap
        minimumLength: 2,
        defaultLength: 12,
    },

    Tasks: {
        G2G: {
            questionAxes: ["x", "v", "a"],
            answersAxes: ["x", "v", "a"],
            correctAnswersCount: 1,
            answersCount: 6,
            zeroAaxis: false
        } as G2GConfig,
        S2G: {
            axes: ["x", "v", "a"],
            doubleGraphChance: 1,
            answersCount: 4,
            zeroAaxis: false
        } as S2GConfig,
        RS: {
            isSimple: false,
            axes: ["x", "v", "a"],
            answersCount: 4,
            segmentsCount: [3, 4],
            zeroAaxis: false
        } as RSConfig
    },

    TextDescription: {
        directions: {
            'вперед': 1,
            'назад': -1,
            'без начальной скорости': 0,
        },
        how: {
            "равномерно ": 0,
            "ускоряясь вперед": 1,
            "ускоряясь назад": -1,
        },
        position: {
            'выше нуля': 1,
            'ниже нуля': -1,
            'в нуле': 0,
        },
        movement: {
            "покоится": 0,
            "движется": 1,
        }
    },


    getAxesCopy(this: any, except: string[] = []): string[] {
        const copy = this.Axes.set.copy();
        for (const item of except) {
            copy.deleteItem(item);
        }

        return copy;
    }
};

