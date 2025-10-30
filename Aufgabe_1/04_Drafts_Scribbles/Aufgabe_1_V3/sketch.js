

let durchmesser;
let verticalstroke;
let horizontalstroke;
let winkel;
let kreis

let kreisinputMin = 0
let kreisinputMax = 100

let rundoutputValueMin
let rundoutputValueMax

let rundoutputValue
let kreisinputValue



function setup() {
  createCanvas(800, 800);

  angleMode(DEGREES);

  durchmesser = createSlider(0, 500, 200)
  durchmesser.position(20, 10);

  verticalstroke = createSlider(0, 400, 200)
  verticalstroke.position(230, 10);


  kreis = createSlider(0, 100, 50);
  kreis.position(430, 10);


  //winkel = createSlider(-45, 45, 0)
  //winkel.position(600, 10);




}


function draw() {
  //background(200, 220, 255,);
  background(0, 0, 0,);

  let d = durchmesser.value();


  kreisinputValue = kreis.value();
  rundoutputValue = map(kreisinputValue, kreisinputMin, kreisinputMax, rundoutputValueMin, rundoutputValueMax);

rundoutputValueMin = 0
rundoutputValueMax = d

if (rundoutputValue < d) {rundoutputValue = 0 }
 
  let Vstroke = verticalstroke.value();
  let Hstroke = 400 - verticalstroke.value();
  let drehen = 0; //winkel.value();


  fill(255, 0, 0, 100)
  noStroke()
  rectMode(CENTER)

  push();
  translate(200, 200);
  rotate(drehen);
  rect(0, 0, d, d, d - rundoutputValue);
  pop();

  push();
  translate(200, 400);
  rotate(drehen);
  rect(0, 0, d, d, rundoutputValue);
  pop();

  push();
  translate(200, 600);
  rotate(drehen);
  rect(0, 0, d, d, d - rundoutputValue);
  pop();

  push();
  translate(400, 200);
  rotate(drehen);
  rect(0, 0, d, d, rundoutputValue);
  pop();

  push();
  translate(400, 400);
  rotate(drehen);
  rect(0, 0, d, d, d - rundoutputValue);
  pop();

  push();
  translate(400, 600);
  rotate(drehen);
  rect(0, 0, d, d, rundoutputValue);
  pop();

  push();
  translate(600, 200);
  rotate(drehen);
  rect(0, 0, d, d, d - rundoutputValue);
  pop();

  push();
  translate(600, 400);
  rotate(drehen);
  rect(0, 0, d, d, rundoutputValue);
  pop();

  push();
  translate(600, 600);
  rotate(drehen);
  rect(0, 0, d, d, d - rundoutputValue);
  pop();


  //rotate(0);
  stroke(255, 255, 0, 50);
  strokeWeight(Vstroke)
  line(200, 0, 200, 800);
  line(400, 0, 400, 800);
  line(600, 0, 600, 800);

  stroke(255, 0, 255, 50);
  strokeWeight(Hstroke)
  line(0, 200, 800, 200);
  line(0, 400, 800, 400);
  line(0, 600, 800, 600);


}
