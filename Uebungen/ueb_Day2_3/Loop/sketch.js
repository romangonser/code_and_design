



function setup() {
  createCanvas(windowWidth, windowHeight);


}


function draw() {
  background(220, 10);

  //initialisierung; bedingung; update
  for (let i = 0; i < 5; i++) {
    //Anweisung
    console.log(i); 
    ellipse(100 * i, height/2, 50, 50, 10); 
  }



}





