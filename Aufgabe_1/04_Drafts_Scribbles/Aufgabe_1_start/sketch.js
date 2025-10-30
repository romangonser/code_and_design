
//SliderCircles

let valueSliderCircles;
let inputMin = 0;
let inputMax = 100;
let outputMin = 10;
let outputMax = 500;
let outputValue
let inputValue
let rund
let verticalstroke


let valueSliderstrokeVertical;



let durchmesser
//let mouseClickedpositionX = mouseIsPressed ? mouseX : 0;
//let mouseClickedpositionY = mouseIsPressed ? mouseY : 0;

function setup() {
  createCanvas(800, 800);

  valueSliderCircles = createSlider(0, 100, 10)
  valueSliderCircles.position(10, 10);

  valueSliderverticalStroke = createSlider(0, 100, 10)
  valueSliderverticalStroke.position(200, 10);

}




function draw() {
  background(200, 220, 255,);

  inputValue = valueSliderCircles.value();
  outputValue = map(inputValue, inputMin, inputMax, outputMin, outputMax);
  let durchmesser = outputValue;
  let rund = durchmesser;
  let zufallcenter = CENTER + random(-50,50);
  verticalstroke = 220;
  horizontalstroke = 50;


  fill(255, 0, 0, 50)
  noStroke()
  rectMode(CENTER)
  rect(200, 200, durchmesser, durchmesser,rund);
  rect(200, 400, durchmesser, durchmesser);
  rect(200, 600, durchmesser, durchmesser, rund);
  rect(400, 200, durchmesser, durchmesser);
  rect(400, 400, durchmesser, durchmesser, rund);
  rect(400, 600, durchmesser, durchmesser);
  rect(600, 200, durchmesser, durchmesser, rund);
  rect(600, 400, durchmesser, durchmesser);
  rect(600, 600, durchmesser, durchmesser, rund);

  stroke(255, 0, 0, 20);
  strokeWeight(horizontalstroke)
  line(200,0,200,800);
  line(400,0,400,800);
  line(600,0,600,800);
  strokeWeight(verticalstroke)
  line(0,200,800,200);
  line(0,400,800,400);
  line(0,600,800,600);

  //stroke(255, 0, 0, 100);
  //line(durchmesser, durchmesser, mouseX, mouseY);


  //mouseClicked = function() {
  //durchmesser += 10;}


  // fill (outputValue, 100,100);
  // ellipse (100, 100, 100, 100);

}
