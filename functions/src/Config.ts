export let Config = {
    axisIndexes: [
        'x', 'v', 'a'
    ],
    bounds: {
        x: [-2, 2], // x
        v: [-1, 1], // v
        a: [-0.5, 0.5], // a
        t: [3, 6],
    } as any,

    X: "x",
    V: "v",
    A: "a",

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
