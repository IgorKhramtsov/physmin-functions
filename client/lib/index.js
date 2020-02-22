"use strict";
let ctx;
window.onload = function () {
    fetch("http://127.0.0.1:5000/physmin/us-central1/getTestDevDebug")
        .then(resp => resp.json())
        .then(body => {
        resolve(body.tests[0]);
    });
};
function resolve(test) {
    let graph, answers = test.answers, list = document.getElementById("list"), list1 = document.getElementById("list1"), canvas = document.getElementById("canvas"), canvas1 = document.getElementById("canvas1"), letter;
    putButton();
    drawGrid(canvas);
    drawGrid(canvas1);
    if (test.type === "relationSings" || test.type === "secondRS") {
        graph = test.question[0].graph;
        letter = graph[0].funcType;
        drawFunctions(canvas, graph, letter);
        // drawAnswers(canvas1, test.answers,test.question.correctIDs);
    }
    if (test.type === "S2G") {
        console.log(test);
        graph = test.question[0].graph;
        let correctIDs = Array();
        for (let func of test.question) {
            for (let id of func.correctIDs)
                correctIDs.push(id);
        }
        let incorrectIDs = Array();
        for (let i = 0; i < 6; ++i) {
            if (correctIDs.indexOf(i) === -1) {
                incorrectIDs.push(i);
            }
        }
        letter = graph[0].funcType;
        canvas1.style.display = "none";
        drawFunctions(canvas, graph, letter);
        drawTextAnswers(list1, test.answers, test.question[0].correctIDs, incorrectIDs);
    }
    if (test.type === "G2G" || test.type === "G2G2") {
        graph = test.question.graph;
        letter = graph[0].funcType;
        drawFunctions(canvas, graph, letter);
        drawAnswers(canvas1, test.answers, test.question.correctIDs);
    }
    if (test.type === "relationSings" || test.type === "secondRS")
        outputFunc(graph, answers, list, true);
    else
        outputFunc(graph, answers, list);
}
function outputFunc(graph, answers, list, isSG = false) {
    let node;
    console.log(answers);
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
    if (isSG) {
        let string = " ";
        for (let answer of answers) {
            node = document.createElement("li");
            node.innerHTML += answer.letter + "[" + answer.leftSegment[0] + ", " + answer.leftSegment[1] + "]";
            if (answer.correctSign == 0)
                string = " = ";
            else if (answer.correctSign == -1)
                string = " < ";
            else
                string = " > ";
            node.innerHTML += string;
            node.innerHTML += answer.letter + "[" + answer.rightSegment[0] + ", " + answer.rightSegment[1] + "]";
            if (list)
                list.appendChild(node);
        }
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
function drawTextAnswers(list, answers, ids, incorrectIDs) {
    let node;
    for (let func of answers) {
        node = document.createElement("li");
        if (func.id === ids[0] || func.id === ids[1]) {
            node.style.color = "#8bc34a";
        }
        else {
            if (func.id === incorrectIDs[0] || func.id === incorrectIDs[1]) {
                node.style.color = "#FF0000";
            }
        }
        node.innerHTML += "id: " + func.id;
        node.innerHTML += ", text: " + func.text;
        if (list)
            list.appendChild(node);
    }
}
function drawFunctions(canvas, graph, letter) {
    let height = canvas.height, width = canvas.width, scaleX = width / 12, scaleY = -1 * height / 10;
    ctx = canvas.getContext("2d");
    ctx.font = "50px Georgia";
    ctx.fillText(letter, 850, 180);
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#FF0000";
    ctx.translate(0, height / 2);
    let y = 0, x = 0, point = 0, step = 0, count = 0;
    for (let func of graph) {
        step = func.params.len ? func.params.len / 10 : 0.3;
        y = calcFuncValue(func, 0) * scaleY;
        ctx.fillText(count.toString(), x, y - 30);
        ctx.moveTo(x, y);
        for (let i = 0; i < 10; i++) {
            point += step;
            y = calcFuncValue(func, point) * scaleY;
            x += step * scaleX;
            ctx.lineTo(x, y);
            ctx.stroke();
        }
        count++;
        point = 0;
    }
}
function drawAnswers(canvas, answers, ids) {
    let height = canvas.height, width = canvas.width, scaleX = width / 18, scaleY = -1 * height / 10;
    let y = 0, x = 0, point = 0, step = 0;
    ctx = canvas.getContext("2d");
    ctx.translate(0, height / 2);
    console.log(answers);
    // console.log(ids);
    for (let func of answers) {
        if (func.id === ids[0] || func.id === ids[1]) {
            ctx.beginPath();
            ctx.lineWidth = 5;
            ctx.strokeStyle = "#8bc34a";
        }
        else {
            ctx.beginPath();
            ctx.lineWidth = 5;
            ctx.strokeStyle = "#03a9f4";
        }
        // console.log(func.id);
        func = func.graph[0];
        step = func.params.len ? func.params.len / 40 : 0.3;
        y = calcFuncValue(func, 0) * scaleY;
        ctx.moveTo(x, y);
        for (let i = 0; i < 10; i++) {
            point += step;
            y = calcFuncValue(func, point) * scaleY;
            x += step * scaleX;
            ctx.lineTo(x, y);
            ctx.stroke();
        }
        ctx.font = "50px Georgia";
        ctx.fillText(func.funcType, x - 30, y - 50);
        point = 0;
    }
}
function drawGrid(canvas) {
    let height = canvas.height, width = canvas.width, scaleX = width / 12, scaleY = -1 * height / 10;
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
        ctx.moveTo(i * scaleX, 0);
        ctx.lineTo(i * scaleX, height);
        ctx.stroke();
        if (i !== 5) {
            ctx.moveTo(0, -i * scaleY);
            ctx.lineTo(width, -i * scaleY);
            ctx.stroke();
        }
    }
}
function putButton() {
    let button = document.getElementById("button");
    let container = document.getElementById("container");
    button.addEventListener("click", function (e) {
        container.classList.toggle('hidden');
    });
}
