
let posX = 0;
let posY = 0;
let angle = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);


}






function draw() {
  background(100, 10);


angle++;

push()
translate(width / 2 - 35, height / 2);
rotate(angle);
fill(255);
rectMode(CENTER);
rect(0, 0, 50, 50);
pop();

push()
translate(width / 2 + 35, height / 2);
rotate((angle + 45) * -1);
fill(255);
rectMode(CENTER);
rect(0, 0, 50, 50);
pop();




  // angle ++;



  // push();
  // rotate(angle);
  // rectMode(CENTER);
  // fill(255);
  // rect(posX + 50, posY + 50, 50, 50);
  // pop();


  // rotate(angle);
  // rectMode(CENTER);
  // fill(255);
  // rect(posX, posY, 50, 50);
 

  
  // rotate(angle);
  // rectMode(CENTER);
  // fill(255);
  // rect(posX - 50, posY - 50, 50, 50);
  // pop();



}
