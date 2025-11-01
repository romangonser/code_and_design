let posX, posY;
let startX, startY;
let maxRadius = 50;
let wirt;
let anti;
let punkt1, punkt2;

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Ersten Wirt initialisieren
  startX = random(width);
  startY = random(height);
  posX = startX;
  posY = startY;
  
  // WICHTIG: Punkte initialisieren!
  punkt1 = createVector(posX, posY);
  punkt2 = createVector(posX, posY);
}

function draw() {
  
  if (mouseIsPressed) {
    // Maus-Modus: Direkt auf Mausposition setzen
    posX = mouseX;
    posY = mouseY;
    maxRadius = maxRadius;
    wirt = createVector(posX, posY);
    fill(100, 0, 100, 50);
    
  } else {
    // Normal-Modus: Random Movement

    fill(100, 50);
  }
  
  if (!mouseIsPressed) {
    posX += random(-10, 10);
    posY += random(-10, 10);
  }

    posX += random(-10, 10);
    posY += random(-10, 10);
    wirt = createVector(posX, posY);
    wirt.add(p5.Vector.random2D().mult(1));

  // Distanz vom aktuellen Nullpunkt berechnen
  let distanceFromStart = dist(wirt.x, wirt.y, startX, startY);
  
  // Wenn Radius größer als maxRadius, ZUERST Linie zeichnen, DANN neuen Wirt
  if (distanceFromStart > maxRadius) {

       // Neuen Wirt erstellen
    startX = random(width);
    startY = random(height);
    posX = startX;
    posY = startY;


    punkt1 = punkt2.copy();
    punkt2 = createVector(posX, posY);
    
    // Linie zeichnen
    stroke(0, 50);
    strokeWeight(2);
    line(punkt1.x, punkt1.y, punkt2.x, punkt2.y);
    
 
  }

  // Ellipse (Wirt) zeichnen
  noStroke();
  ellipse(wirt.x, wirt.y, 15, 15);

}

  // wenn ein neuer wirt auf einer schon bestehendem wirt kommt,
  // neue Farbe kreiieren.
  // if () {
  // }

//mouse interaktion

  if (red > 50 && green > 50 && blue > 50) {
    fill(0, 255, 0);
    }






// if(mouseIsPressed) {


//     for (let i = 0; i < 20; i++) {
    
//     fill(0, 50, 200, 50)
//  let streuX = random(-20, 20);
//   let streuY = random(-20, 20);

//     ellipse(mouseX + streuX, mouseY + streuY, 10, 10, 10); 
//   }
// }

  //  fill(100, 100, 255, 150);
  // noStroke();
  // ellipse(mouseX, mouseY, 10, 10);
  
 






  // if (distanceFromStart > maxRadius) {
  //   startX = wirt.x + random (-200,200);
  //   startY = wirt.y + random (-200, 200);
    
  //   posX = startX;
  //   posY = startY;
