let posX, posY; // position Zeichnen ellipse-wirt
let startX, startY; // Nullpunkt des aktuellen "Wirts"
let maxRadius = 50; // Radius bevor neuer Wirt entsteht


function setup() {
  createCanvas(windowWidth, windowHeight);
  // Ersten Wirt erstellen
  startX = random(width);
  startY = random(height);

  streuX += random(-10, 10);
  streuY += random(-10, 10);

}

function draw() {
background(0, 0)

  for (let i = 0; i < 50; i++) {
    ellipse(streuX, streuY, 50, 50, 10); 
  }
  
  // Distanz vom Strartpunkt des aktuellen Wirt berrechen(startX, startY)
  let distanceFromStart = dist(wirt.x, wirt.y, startX, startY);
  
  // Wenn Radius größer als 50px, neuen Wirt erstellen
  if (distanceFromStart > maxRadius) {
    startX = random(width);
    startY = random(height);
  
  }

  // wenn ein neuer wirt auf einer schon bestehendem wirt kommt,
  // neue Farbe kreiieren.
  // if () {
  // }

//mouse interaktion
if(mouseIsPressed) {

    for (let i = 0; i < 5; i++) {
    //Anweisung
    fill(100, 100, 10)
    ellipse(mouseX + posX + i, mouseY + posY + i, 50, 50); 

 } 
}




}


  // if (distanceFromStart > maxRadius) {
  //   startX = wirt.x + random (-200,200);
  //   startY = wirt.y + random (-200, 200);
    
  //   posX = startX;
  //   posY = startY;
