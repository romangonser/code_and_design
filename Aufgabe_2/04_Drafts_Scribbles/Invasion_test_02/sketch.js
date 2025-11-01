let posX, posY; // position Zeichnen ellipse-wirt
let startX, startY; // Nullpunkt des aktuellen "Wirts"
let maxRadius = 50; // Radius bevor neuer Wirt entsteht


function setup() {
  createCanvas(windowWidth, windowHeight);
  // Ersten Wirt initialisieren
  startX = random(width);
  startY = random(height);
  posX = startX;
  posY = startY;
}

function draw() {
  posX += random(-10, 10);
  posY += random(-10, 10);

  wirt = createVector(posX, posY);
  wirt.add(p5.Vector.random2D().mult(1));
  
  fill(200, 0, 100, 50);
  noStroke();
  ellipse(wirt.x, wirt.y, 10, 10);
  
  // Distanz vom aktuellen Nullpunkt (startX, startY) berechnen
  let distanceFromStart = dist(wirt.x, wirt.y, startX, startY);
  
  // Wenn Radius größer als 50px, neuen Wirt erstellen
  if (distanceFromStart > maxRadius) {
    startX = random(width);
    startY = random(height);
    posX = startX;
    posY = startY;
  }

  // wenn ein neuer wirt auf einer schon bestehendem wirt kommt,
  // neue Farbe kreiieren.
  // if () {
  // }

//mouse interaktion
if(mouseIsPressed) {

   fill(200, 0, 100, 150);
  noStroke();
  ellipse(mouseX, mouseY, 10, 10);
  
 } 
}





  // if (distanceFromStart > maxRadius) {
  //   startX = wirt.x + random (-200,200);
  //   startY = wirt.y + random (-200, 200);
    
  //   posX = startX;
  //   posY = startY;
