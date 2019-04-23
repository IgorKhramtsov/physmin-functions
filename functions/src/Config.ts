export let Config = {
    axisIndexes: [
        'x', 'v', 'a'
    ],
    bounds: {
        x: [-4, 4], // x
        v: [-1, 1], // v
        a: [-0.5, 0.5], // a
        t: [3, 6],
        questionCount: [3,5],
    } as any,

    X: "x",
    V: "v",
    A: "a",

    upperLimit: 5,

    vLowerLimit: 0.1,
    aLowerLimit: 0.1,

    minLength: 2,

    movements: [
        "движется",
        "покоится",
    ],
    directions: [
        "вперед",
        "назад",
    ],
    conditions: [
        "не меняя скорость",
        "меняя скорость",
    ],
    when: [
        "вначале",
        "до остановки",
        "все время",
        "потом",
    ],

    letters: [
        "S",
        "S",
        "S",
        "dx",
        "dx",
        "dx",
    ]

};
