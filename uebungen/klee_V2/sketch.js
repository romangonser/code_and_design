

let durchmesser;
let verticalstroke;
let horizontalstroke;
let winkel;



function setup() {
  createCanvas(800, 800);

  durchmesser = createSlider(20, 500, 100)
  durchmesser.position(20, 10);

  verticalstroke = createSlider(0, 100, 10)
  verticalstroke.position(230, 10);

  horizontalstroke = createSlider(0, 100, 10)
  horizontalstroke.position(430, 10);

  winkel = createSlider(0, TWO_PI, 0.1, 0)
  winkel.position(600, 10);
  


}


function draw() {
   background(200, 220, 255,);

  let d = durchmesser.value();
  let rund = d;
  let Vstroke = verticalstroke.value();
  let Hstroke = horizontalstroke.value();
  let angle = winkel.value();


  fill(255, 0, 0,100)
  noStroke()
  rectMode(CENTER)
  rect(200, 200, d, d, rund);
  rect(200, 400, d, d);
  rect(200, 600, d, d, rund);
  rect(400, 200, d, d);
  rect(400, 400, d, d, rund);
  rect(400, 600, d, d);
  rect(600, 200, d, d, rund);
  rect(600, 400, d, d);
  rect(600, 600, d, d, rund);

  stroke(255, 0, 0, 20);
  strokeWeight(Vstroke)
  line(200, 0, 200, 800);
  line(400, 0, 400, 800);
  line(600, 0, 600, 800);
  strokeWeight(Hstroke)
  line(0, 200, 800, 200);
  line(0, 400, 800, 400);
  line(0, 600, 800, 600);



}
