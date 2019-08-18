export let Config = {
    Axes: [
        'x', 'v', 'a'
    ],

    X: "x",
    V: "v",
    A: "a",

    bounds: {
        x: [0.1, 4],
        v: [0.1, 1],
        a: [0.1,0.5],
        questionCount: [3,4],
    } as any,


    upperLimit: 5,
    lowerLimit: 2,
    defaultLength: 12,


    answerCount: 6,
    G2S_questionCount: 4,


    directions:{
      'вперед': 1,
      'назад': -1,
    },
    how: {
      "равномерно ": 0,
      "ускоряясь вперед": 1,
      "ускоряясь назад": -1,
    },
    position:{
      'выше нуля': 1,
      'ниже нуля': -1,
      'в нуле': 0,
    },
    movement:{
      "покоится": 0,
      "движется": 1,
    }
};
