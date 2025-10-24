
//Slider

let valueSlider;

let inputMin = -10;
let inputMax = 38;

let outputMin = 0;
let outputMax = 255;

let outputValue
let inputValue 
//Temperatur zu Farbe




function setup() {
  createCanvas(400, 400);

  valueSlider = createSlider(-10, 38, 9)
  valueSlider.position(10, 10);

}




function draw() {

 inputValue = valueSlider.value();

  outputValue = map(inputValue, inputMin, inputMax, outputMin, outputMax);

 // let kreisoutputvalue = map(inputValue, inputMin, inputMax, outputMax, outputMin)

  background(outputValue);

  fill(255 - outputValue)
  noStroke()
  ellipse(200, 200, 400, 400)


  // fill (outputValue, 100,100);
  // ellipse (100, 100, 100, 100);

}
