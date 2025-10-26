
//SliderCircles

let valueSliderCircles;
let inputMin = 0;
let inputMax = 100;
let outputMin = 10;
let outputMax = 500;
let outputValue
let inputValue
let rund


let durchmesser
//let mouseClickedpositionX = mouseIsPressed ? mouseX : 0;
//let mouseClickedpositionY = mouseIsPressed ? mouseY : 0;

function setup() {
  createCanvas(800, 800);

  valueSliderCircles = createSlider(0, 100, 10)
  valueSliderCircles.position(10, 10);

}




function draw() {
  background(200, 220, 255,);

  inputValue = valueSliderCircles.value();
  outputValue = map(inputValue, inputMin, inputMax, outputMin, outputMax);
  let durchmesser = outputValue;
  let rund = durchmesser;

  fill(255, 0, 0, 100)
  noStroke()
  rect(200, 200, durchmesser, durchmesser,rund);
  rect(200, 400, durchmesser, durchmesser);
  rect(200, 600, durchmesser, durchmesser, rund);
  rect(400, 200, durchmesser, durchmesser);
  rect(400, 400, durchmesser, durchmesser, rund);
  rect(400, 600, durchmesser, durchmesser);
  rect(600, 200, durchmesser, durchmesser, rund);
  rect(600, 400, durchmesser, durchmesser);
  rect(600, 600, durchmesser, durchmesser, rund);




  stroke(255, 0, 0, 100);
  line(durchmesser, durchmesser, mouseX, mouseY);


  //mouseClicked = function() {
  //durchmesser += 10;}


  // fill (outputValue, 100,100);
  // ellipse (100, 100, 100, 100);

}
