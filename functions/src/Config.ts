export let Config = {

    Axes: {
        Set: [
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

    Limits: {
        upperLimit: 5,
        lowerLimit: 2,
        defaultLength: 12,
    },

    Tasks: {
        G2G: {
            questionCount: 1,
            answersCount: 6
        },
        G2S: {
            questionCount: 4,
            answersCount: 4
        },
        S2G: {
            questionCount: [3, 4],
            simple: {
                answersCount: 3
            },
            complex: {
                answersCount: 6
            }
        }
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
    }

};

