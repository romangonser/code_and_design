



function setup() {
  createCanvas(windowWidth, windowHeight);


}


function draw() {
  background(0);


  // plan: durchmesser der ellipse abhängig von distanz der Mouse
  let durchmesser;
  let distanz = dist(mouseX, mouseY, width / 2, height / 2)

  durchmesser = map(distanz, 0, width / 2, 10, width / 2)

  ellipse(width / 2, height / 2, durchmesser, durchmesser,)
 

  // Fill(255, 0, 0)
  // ellipse(mouseX, mouseY, durchmesser / 2, durchmesser / 2)



}





