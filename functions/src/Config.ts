export let Config = {
    axisIndexes: [
        'x', 'v', 'a'
    ],
    bounds: {
        x: [-4, 4], // x
        v: [-1, 1], // v
        a: [-0.5,0.5], // a
        t: [3, 6],
        questionCount: [3,5],
    } as any,

    X: "x",
    V: "v",
    A: "a",

    upperLimit: 5,
    defaultLength: 12,

    minLength: 2,

    answerCount: 6,

    G2S_questionCount: 4,

    //v
    directions: {
      "назад": -1,
      "вперед": 1,
      "покой": 0,
    },
    //a
    how: {
      " равномерно ": 0,
      " ускоряясь вперед": 1,
      " ускоряясь назад": -1,
    },
    //x
    position:{
      " выше нуля": 1,
      " ниже нуля": -1,
      " все время": 0,
    }
};
