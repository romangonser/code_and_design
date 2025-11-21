

let durchmesser;
let verticalstroke;
let horizontalstroke;
let winkel;
let kreis;
let imputsliderkreis;
let sliderkreismin = 0;
let outputrundmin = 0;
let sliderkreismax = 200;
let mitteX = 0;
let mitteY = 0;
let button;
let rund;



function setup() {
  createCanvas(800, 800);

  durchmesser = createSlider(0, 400, 100)
  durchmesser.position(20, 10);

  verticalstroke = createSlider(0, 400, 200)
  verticalstroke.position(230, 10);


  kreis = createSlider(0, 200, 100);
  kreis.position(430, 10);

  button = createButton('try me');
  button.position(620, 10);

  button.mousePressed(verschieben)

}


function draw() {
  background(0);


  let outputrundmax = durchmesser.value();
  inputkreis = kreis.value();
  rund = map(inputkreis, sliderkreismin, sliderkreismax, outputrundmin, outputrundmax);


  let d = durchmesser.value();
  let Vstroke = verticalstroke.value();
  let Hstroke = 400 - verticalstroke.value();




  stroke(255, 255, 0, 50);
  strokeWeight(Vstroke + mitteY)
  line(200, 0, 200, 800);
  line(400, 0, 400, 800);
  line(600, 0, 600, 800);

  stroke(255, 0, 255, 50);
  strokeWeight(Hstroke + mitteX)
  line(0, 200, 800, 200);
  line(0, 400, 800, 400);
  line(0, 600, 800, 600);


  fill(255, 50)
  strokeWeight(2)
  stroke(255, 50)
  rectMode(CENTER)

  rect(400 + mitteX, 400 + mitteY, d * 2, d * 2, rund * 2);

  rect(200 + mitteX, 200, d * 2, d * 2, rund * 2);
  rect(200, 400, d * 2, d * 2, d * 2 - rund * 2);
  rect(200, 600 + mitteY, d * 2, d * 2, rund * 2);
  rect(400, 200, d * 2, d * 2, d * 2 - rund * 2);

  rect(400, 600, d * 2, d * 2, d * 2 - rund * 2);
  rect(600, 200 + mitteY, d * 2, d * 2, rund * 2);
  rect(600, 400, d * 2, d * 2, d * 2 - rund * 2);
  rect(600 + mitteX, 600, d * 2, d * 2, rund * 2);

  fill(255, 150)
  strokeWeight(2)
  stroke(255, 150)
  rectMode(CENTER)



  rect(400 + mitteX, 400 + mitteY, d, d, d - rund);

  rect(200 + mitteX, 200, d, d, d - rund);
  rect(200, 400, d, d, rund);
  rect(200, 600 + mitteY, d, d, d - rund);
  rect(400, 200, d, d, rund);

  rect(400, 600, d, d, rund);
  rect(600, 200 + mitteY, d, d, d - rund);
  rect(600, 400, d, d, rund);
  rect(600 + mitteX, 600, d, d, d - rund);




}

function verschieben() {
  mitteX = random(-150, 150);
  mitteY = random(-150, 150);

}

