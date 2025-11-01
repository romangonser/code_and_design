let posX, posY; // position Zeichnen ellipse-wirt
let startX, startY; // Nullpunkt des aktuellen "Wirts"
let maxRadius = 50; // Radius bevor neuer Wirt entsteht
let wirt;
let anti;




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

  //test, ob an der zielposition wirt.x, wirt.y bereits Farbe liegt und welche
  let c = get(wirt.x, wirt.y);
  let rotkanal = red(c);
  let blaukanal = blue(c);
  let gruenkanal = green(c);
  let transparenz = alpha(c);
  //console.log(rotkanal, blaukanal, gruenkanal)
  if(transparenz> 150 ){
    //es hat hier bereits farbe
    fill(255, 0, 0);
  }else{
    fill(200, 0, 100, 50);
  }
  
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
  for (let i = 0; i < 10; i++) {
    fill(0, 50, 200, 50);
    noStroke();
    
    // Organische Streuung: mehr Punkte nah an der Maus
    let distance = randomGaussian(0, 10); // Normalverteilung um 0, Standardabweichung 5
    let offset = p5.Vector.random2D().mult(distance);
    
    ellipse(mouseX + offset.x, mouseY + offset.y, 10, 10); 
  }
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
  
 } 






  // if (distanceFromStart > maxRadius) {
  //   startX = wirt.x + random (-200,200);
  //   startY = wirt.y + random (-200, 200);
    
  //   posX = startX;
  //   posY = startY;
