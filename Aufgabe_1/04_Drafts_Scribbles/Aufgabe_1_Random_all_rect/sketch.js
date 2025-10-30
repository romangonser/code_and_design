let durchmesser;
let verticalstroke;
let kreis;
let sliderkreismin = 0;
let outputrundmin = 0;
let sliderkreismax = 200;
let mitteX = [];  // ✅ Array für x-Positionen
let mitteY = [];  // ✅ Array für y-Positionen
let button;
let rund;

function setup() {
  createCanvas(800, 800);
  angleMode(DEGREES);

  // Initialisiere 9 Rechtecke
  for (let i = 0; i < 9; i++) {
    mitteX[i] = 0;
    mitteY[i] = 0;
  }

  durchmesser = createSlider(0, 500, 200);
  durchmesser.position(20, 10);

  verticalstroke = createSlider(0, 400, 200);
  verticalstroke.position(230, 10);

  kreis = createSlider(0, 200, 100);
  kreis.position(430, 10);

  button = createButton('try me');
  button.position(620, 10);
  button.mousePressed(verschieben);
}

function draw() {
  background(0, 0, 0);
  let outputrundmax = durchmesser.value();

  let inputkreis = kreis.value();
  rund = map(inputkreis, sliderkreismin, sliderkreismax, outputrundmin, outputrundmax);

  let d = durchmesser.value();
  let Vstroke = verticalstroke.value();
  let Hstroke = 400 - verticalstroke.value();

  fill(255, 100);
  strokeWeight(2);
  stroke(255, 100);
  rectMode(CENTER);

  // Jedes Rechteck mit eigenem Offset
  rect(200 + mitteX[0], 200 + mitteY[0], d, d, d - rund);
  rect(200 + mitteX[1], 400 + mitteY[1], d, d, rund);
  rect(200 + mitteX[2], 600 + mitteY[2], d, d, d - rund);
  rect(400 + mitteX[3], 200 + mitteY[3], d, d, rund);
  rect(400 + mitteX[4], 400 + mitteY[4], d, d, d - rund);
  rect(400 + mitteX[5], 600 + mitteY[5], d, d, rund);
  rect(600 + mitteX[6], 200 + mitteY[6], d, d, d - rund);
  rect(600 + mitteX[7], 400 + mitteY[7], d, d, rund);
  rect(600 + mitteX[8], 600 + mitteY[8], d, d, d - rund);

  stroke(255, 255, 0, 50);
  strokeWeight(Vstroke);
  line(200, 0, 200, 800);
  line(400, 0, 400, 800);
  line(600, 0, 600, 800);

  stroke(255, 0, 255, 50);
  strokeWeight(Hstroke);
  line(0, 200, 800, 200);
  line(0, 400, 800, 400);
  line(0, 600, 800, 600);
}

function verschieben() {
  // Jedes Rechteck bekommt eigene Zufallswerte
  for (let i = 0; i < 9; i++) {
    mitteX[i] = random(-50, 50);
    mitteY[i] = random(-50, 50);
  }
}