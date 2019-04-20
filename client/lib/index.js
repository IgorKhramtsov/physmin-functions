"use strict";
window.onload = function () {
    fetch("http://127.0.0.1:5000/physmin/us-central1/getTestDev")
        .then(resp => resp.json())
        .then(body => { console.log(body); });
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    ctx.fillRect(0, 0, 150, 75);
};
