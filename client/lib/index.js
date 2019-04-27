"use strict";
let ctx;
window.onload = function () {
    fetch("http://127.0.0.1:5000/physmin/us-central1/getTestDev")
        .then(resp => resp.json())
        .then(body => { resolve(body.tests[0]); });
};
function resolve(test) {
    let graph = test.question[0].graph, canvas = document.getElementById("canvas"), list = document.getElementById("list"), letter = graph[0].funcType, height = canvas.height, width = canvas.width, scaleX = width / 12, scaleY = -1 * height / 10;
    ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#000000";
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
    ctx.stroke();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
        if (i === 5)
            continue;
        ctx.moveTo(0, -i * scaleY);
        ctx.lineTo(width, -i * scaleY);
        ctx.stroke();
    }
    ctx.font = "50px Georgia";
    ctx.fillText(letter, 850, 180);
    ctx.translate(0, height / 2);
    outputFunc(graph, list);
    let y = 0, x = 0, point = 0, step = 0;
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#FF0000";
    for (let func of graph) {
        step = func.params.len / 10;
        y = calcFuncValue(func, 0) * scaleY;
        ctx.moveTo(x, y);
        for (let i = 0; i < 10; i++) {
            point += step;
            y = calcFuncValue(func, point) * scaleY;
            x += step * scaleX;
            ctx.lineTo(x, y);
            ctx.stroke();
        }
        point = 0;
    }
}
function outputFunc(graph, list) {
    let node;
    for (let func of graph) {
        node = document.createElement("li");
        if (func.params.x !== undefined)
            node.innerHTML += "x: " + func.params.x;
        if (func.params.v !== undefined)
            node.innerHTML += " v: " + func.params.v;
        if (func.params.a !== undefined)
            node.innerHTML += " a: " + func.params.a;
        if (func.params.len !== undefined)
            node.innerHTML += " len: " + func.params.len;
        if (list)
            list.appendChild(node);
    }
}
function calcFuncValue(func, t) {
    let funcType = func.funcType, params = func.params, len = (t === undefined) ? params.len : t;
    switch (funcType) {
        case "x":
            return params.x + params.v * len + (params.a * len * len) / 2;
        case "v":
            return params.v + params.a * len;
        case "a":
            return params.a;
    }
}
