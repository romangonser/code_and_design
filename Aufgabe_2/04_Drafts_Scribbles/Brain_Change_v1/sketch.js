let posX, posY;
let startX, startY;
let maxRadius = 50;
let wirt;
let punkt1, punkt2;
let newColor;

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Ersten Wirt poition
  startX = random(width);
  startY = random(height);
  posX = startX;
  posY = startY;

  // Punkte für Linie bestimmen
  punkt1 = createVector(posX, posY);
  punkt2 = createVector(posX, posY);

}

function draw() {


  // ohne click Schlaufe
  posX += random(-10, 10);
  posY += random(-10, 10);
  wirt = createVector(posX, posY);
  wirt.add(p5.Vector.random2D().mult(1));

   //test, ob an der zielposition wirt.x, wirt.y bereits Farbe liegt und welche
  let c = get(wirt.x, wirt.y);
  let transparenz = alpha(c);
  //console.log(rotkanal, blaukanal, gruenkanal)


if(transparenz > 255/2){
  // es hat hier bereits farbe
  
  for(let i = 0; i < 5; i++){
    newColor = color(random(255), random(255), random(255), 50);
  }
   fill(newColor);
} else {
  fill(200, 0, 100, 50);
}





  // Distanz vom aktuellen Nullpunkt berechnen
  let distanceFromStart = dist(wirt.x, wirt.y, startX, startY);

  // Wenn Radius größer als maxRadius, neuen Wirt erstellen
  if (distanceFromStart > maxRadius) {
    punkt1 = punkt2.copy();
    punkt2 = createVector(posX, posY);


    // Neuen Wirt erstellen (wenn dieser Teil vor Linie Zeichnen ist, Linie wird zuerst gezeichnet)
    startX = random(width);
    startY = random(height);
    posX = startX;
    posY = startY;

    // Linie zeichnen
    stroke(0, 50);
    strokeWeight(2);
    line(punkt1.x, punkt1.y, punkt2.x, punkt2.y);


  }

  // Wirt zeichnen
  noStroke();
  ellipse(wirt.x, wirt.y, 10, 10);
}

// NEUE FUNKTION: Wird bei jedem Mausklick ausgeführt
function mousePressed() {
  // Linie vom letzten Punkt zur Mausposition zeichnen
  punkt1 = punkt2.copy();
  punkt2 = createVector(mouseX, mouseY);

  stroke(0, 50);
  strokeWeight(2);
  line(punkt1.x, punkt1.y, punkt2.x, punkt2.y);

  // Neuen Wirt an Mausposition erstellen
  startX = mouseX;
  startY = mouseY;
  posX = startX;
  posY = startY;
}