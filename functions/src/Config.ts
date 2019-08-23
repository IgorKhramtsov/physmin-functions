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
        sign2graph_questionCount: [3,4],
    } as any,


    upperLimit: 5,
    lowerLimit: 2,
    defaultLength: 12,

    graph2graph_questionCount: 1,
    graph2graph_answersCount: 6,

    graph2state_questionCount: 4,
    graph2state_answersCount: 4,

    sign2graph_simple_answersCount: 3,
    sign2graph_complex_answersCount: 6,

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
