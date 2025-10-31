let durchmesser;
durchmesser=10;

let rotwert = 0;

//let durcmesser = 10;

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function mouseClicked (){
  rotwert = rotwert +30
}
function draw() {
  background(70,100, 50, 25);

console.log(rotwert)
//mouseX
//mouseY

  noStroke()
  fill(mouseY / 3, 0, 0)
  rect(mouseX, 20, 100, 150);

  fill(rotwert, 0,0, 150)
  ellipse(100, 100, durchmesser, durchmesser)
  durchmesser = durchmesser +0.2



function mouseClicked (){
  rotwert = rotwert +30
}

}


 //ellipse(mouseX-20, mouseY-50, durchmesser, durchmesser)


  //  fill(rotwert, 0,0, 150)
  // ellipse(100, 100, durchmesser, durchmesser)
  //durchmesser = durchmesser +1
  // rotwert=rotwert +0.5