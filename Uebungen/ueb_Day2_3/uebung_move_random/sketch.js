



// exakt gleich  ==  PosX == 350 ist ein vergleich und liefert true oder false
// ungleich      !=  PosX != 350 (trifft immer zu ausser posX ist 350)
// grösser als   >   PosX > 350 (trifft zu wenn posX 351 oder mehr ist)
// kleiner als   <   PosX < 350 (trifft zu wenn posX 349 oder weniger ist)
// grösser gleich >= PosX >= 350 (trifft zu wenn posX 350 oder mehr ist)
// kleiner gleich <= PosX <= 350 (trifft zu wenn posX 350 oder weniger ist)




let posX = 0;
let posY = 0;
let threshold;


function setup() {
  createCanvas(windowWidth, windowHeight);
  threshold = width / 3;

}


function draw() {
  background(220,10);

  if(posX < threshold){
    //Farbe vor der position 120
    fill(255, 0, 0);
  }else{
    //Farbe nach der position 120
    fill(0, 0, 255);
  }

  // Zufallwert für y position
  //Framecount

if(frameCount % 3 == 0){ // alle 3 frames
  posY = random(height);
  rect(posX, posY, 50, 50);
}


   posX = posX + 1; //posX++
    posY = posY + 1;

  if (posX >= width - 50 && posY >= height - 50) { //50 ist die breite des rechtecks
    posX = 0; //posX++
    posY = 0;  

  }


}


//if (posX +50 > width) {
//  posX = 0; 
//}

//if (posY +50 > height) {
//  posY = 0; 
//}


//if(posX == with350){
//noLoop();





