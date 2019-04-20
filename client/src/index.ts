let ctx: CanvasRenderingContext2D;

window.onload = function() {
  fetch("http://127.0.0.1:5000/physmin/us-central1/getTestDev")
    .then(resp => resp.json())
    .then(body => { resolve(body.tests[0]) })


}


function resolve(test: any) {
  let graph = test.question[0].graph;
  let canvas: any = document.getElementById("canvas");
  this.ctx = canvas.getContext("2d");
  ctx.fillRect(0, 0, 150, 75);
  for (let func of graph) {
    let x = 0, v = 0, a = 0;
    let len = func.params.len;
    if (func.params.x === undefined) {
      if (func.params.v === undefined)
        x = func.params.a;
      else {
        x = func.params.v;
        v = func.params.a;
      }
    }
    else {
      x = func.params.x;
      v = func.params.v;
      a = func.params.a;
    }

    ctx.moveTo(0, x);
  }
}
