let posX, posY;
let startX, startY;
let maxRadius = 60;
let wirt;
let punkt1, punkt2;
let t = 20 // transparenz 
let newColor
let zähler = {}

let alleFormen = [];
let animationLäuft = true;

function setup() {
  createCanvas(windowWidth, windowHeight);


  colorMode(HSB, 360, 100, 100, 100)
  newColor = color(random(0, 360), 100, 100, t);

  // Ersten Wirt poition
  startX = random(width);
  startY = random(height);
  posX = startX;
  posY = startY;

  // Punkte für Linie bestimmen
  punkt1 = createVector(posX, posY);
  punkt2 = createVector(posX, posY);


  //background(0, 0, 0, 95)


}

function draw() {
  background(0, 1)






  // ohne click Schlaufe
  posX += random(-10, 10);
  posY += random(-10, 10);
  wirt = createVector(posX, posY);
  wirt.add(p5.Vector.random2D().mult(8));

  //test, ob an der zielposition wirt.x, wirt.y bereits Farbe liegt und welche
let c = get(wirt.x, wirt.y);
let rotkanal = red(c);
let gruenkanal = green(c);
let blaukanal = blue(c);

// // Prüfen: alle Kanäle gleich UND < 50
// let transparenz = (rotkanal === gruenkanal && gruenkanal === blaukanal && rotkanal > 100);

// if (transparenz) {
//   // Pixel ist dunkel → neue Farbe setzen
//   newColor = color(random(0, 360), 100, 100, t);
// }


let key = int(wirt.x / 50) + "," + int(wirt.y / 50);
if (!zähler[key]) zähler[key] = 0;
zähler[key]++;

if (zähler[key] > 50) { 
  newColor = color(random(0,360), 100,100,t);
  zähler[key] = 0;
}

fill(newColor);
stroke(newColor);





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
    stroke(newColor);
    strokeWeight(random(0.5, 5));
    line(punkt1.x, punkt1.y, punkt2.x, punkt2.y);


  }

  // Wirt zeichnen
  noStroke();
  fill(newColor);

  if (mouseX > width / 2) {
    // Maus auf der rechten Seite → Dreieck
    triangle(
      wirt.x, wirt.y - 10,
      wirt.x - 10, wirt.y + 10,
      wirt.x + 10, wirt.y + 10);
  } else {
    // Maus auf der linken Seite = Kreis
    ellipse(wirt.x, wirt.y, 15, 15);
  }



}

// Wird bei jedem Mausklick ausgeführt


function mousePressed() {

  //zähler++

  // NUR JEDES 5. MAL NEUE FARBE
  // if (zähler % 5 == 0) {
  //   newColor = color(random(0, 360), 100, 100, t);
  // }
  newColor = color(random(0, 360), 100, 100, t);

  // Linie vom letzten Punkt zur Mausposition zeichnen
  punkt1 = punkt2.copy();
  punkt2 = createVector(mouseX, mouseY);
  fill(newColor);
  stroke(newColor);
  strokeWeight(random(0.5, 5));
  line(punkt1.x, punkt1.y, punkt2.x, punkt2.y);

  // Neuen Wirt an Mausposition erstellen
  startX = mouseX;
  startY = mouseY;
  posX = startX;
  posY = startY;


}

