let distanzpunkt;[]
let mouseradius = 200
let posX, posY;
let startX, startY;
let maxRadius = 60
let KreisD = 15
let wirt;
let punkt1, punkt2;
let multidist
let t = 20 // transparenz 
let newColor
let zähler = {}
let timer = 0
let mousedist = 500

let alleFormen = [];
let animationLäuft = true;




function setup() {
  createCanvas(windowWidth, windowHeight);


  colorMode(HSB, 360, 100, 100, 100)
  newColor = color(random(0, 360), 100, 100, t);
  //blendMode(SCREEN);

  // Ersten Wirt poition
 
  let minAbstandZurMaus = 200;  // NEUE ZEILE
  
  do {
    startX = random(width);
    startY = random(height);
  } while (dist(startX, startY, mouseX, mouseY) < minAbstandZurMaus);
 
 posX = startX;
  posY = startY;


  // Punkte für Linie bestimmen
  punkt1 = createVector(posX, posY);
  punkt2 = createVector(posX, posY);


  //background(0, 0, 0, 95)



}

function draw() {
  background(0, 1)



  //background(0, 10)


       if (timer > 0) {
    timer--;
    // Timer läuft
  } else {
    // Timer abgelaufen - zurück auf normal
    multidist = 10;
   strokeWeight(random(0.5, 5));
  }

 if (mouseIsPressed) {
    posX = mouseX;
    posY = mouseY;
    wirt = createVector(posX, posY);
    stroke(0,0,0,0);

    //KreisD = random(5, 25)
  } else {
    // Normale Animation ohne Mausklick
    posX += random(-10, 10);
    posY += random(-10, 10);
    wirt = createVector(posX, posY);
    wirt.add(p5.Vector.random2D().mult(8));
    stroke(newColor);
    //KreisD = 15
   
  }

  // ohne click Schlaufe
  posX += random(-10, 10);
  posY += random(-10, 10);
  wirt = createVector(posX, posY);
  wirt.add(p5.Vector.random2D().mult(multidist));

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
console.log (zähler)
fill(newColor);
stroke(newColor);





  // Distanz vom aktuellen Nullpunkt berechnen
  let distanceFromStart = dist(wirt.x, wirt.y, startX, startY);

  // Wenn Radius größer als maxRadius, neuen Wirt erstellen
// Wenn Radius größer als maxRadius, neuen Wirt erstellen
if (distanceFromStart > maxRadius) {
    punkt1 = punkt2.copy();
    punkt2 = createVector(posX, posY);

    // Linie zeichnen
    stroke(newColor);
    strokeWeight(random(0.5, 5));
    line(punkt1.x, punkt1.y, punkt2.x, punkt2.y);

    // Neuen Wirt erstellen mit zwei Bedingungen
    let versuch = 0;
    let gefunden = false;
    let maxAbstandZumAlten = 200;  // Max. Abstand zum alten Punkt
    let minAbstandZurMaus = 200;   // Min. Abstand zur Maus
    
    while (!gefunden && versuch < 100) {
      let neuerStartX = random(width);
      let neuerStartY = random(height);
      
      // Abstand zum alten Punkt prüfen
      let abstandZumAlten = dist(neuerStartX, neuerStartY, wirt.x, wirt.y);
      
      // Abstand zur Maus prüfen
      let abstandZurMaus = dist(neuerStartX, neuerStartY, mouseX, mouseY);
      
      // BEIDE Bedingungen müssen erfüllt sein
      if (abstandZumAlten <= maxAbstandZumAlten && abstandZurMaus >= minAbstandZurMaus) {
        startX = neuerStartX;
        startY = neuerStartY;
        gefunden = true;
      }
      versuch++;
    }
    
    // Fallback wenn nichts gefunden
    if (!gefunden) {
      startX = random(width);
      startY = random(height);
    }
    
    posX = startX;
    posY = startY;
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
    circle(wirt.x, wirt.y, KreisD);
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


//wird bei doppelklick ausgeführt


function doubleClicked (){
   multidist = 100;
  timer = 15;
  strokeWeight(random(7, 10));

}



// let punkte = [];
// let maxAbstand = 100;

// function setup() {
//   createCanvas(400, 400);
//   // Erster Punkt
//   punkte.push(createVector(random(width), random(height)));
// }

// function draw() {
//   background(220);
  
//   // Neuen zufälligen Punkt erstellen
//   let neuerPunkt = createVector(random(width), random(height));
//   let letzterPunkt = punkte[punkte.length - 1];
  
//   // Distanz prüfen
//   let abstand = dist(neuerPunkt.x, neuerPunkt.y, letzterPunkt.x, letzterPunkt.y);
  
//   if (abstand <= maxAbstand) {
//     punkte.push(neuerPunkt);  // Nur hinzufügen wenn nah genug
//   }
  
//   // Alle Punkte zeichnen
//   for (let p of punkte) {
//     circle(p.x, p.y, 10);
//   }
// }