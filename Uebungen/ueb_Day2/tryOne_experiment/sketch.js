



// exakt gleich  ==  PosX == 350 ist ein vergleich und liefert true oder false
// ungleich      !=  PosX != 350 (trifft immer zu ausser posX ist 350)
// grösser als   >   PosX > 350 (trifft zu wenn posX 351 oder mehr ist)
// kleiner als   <   PosX < 350 (trifft zu wenn posX 349 oder weniger ist)
// grösser gleich >= PosX >= 350 (trifft zu wenn posX 350 oder mehr ist)
// kleiner gleich <= PosX <= 350 (trifft zu wenn posX 350 oder weniger ist)


let particles = [];

let posX = 0;
let posY = 0;
let threshold;



function setup() {
  createCanvas(windowWidth, windowHeight);

  
  threshold = width / 2;

}


function draw() {
 
  background(255,5);

particles.push(new Particle(posX, posY, 10, 10) );

for(let i=particles.length-2; i>=0; i--) {
		particles[i].update(particles);
		particles[i].show() ;
		if(particles[i].alpha<=2) particles.splice(i, 5); // remove the dead particle
	}

  if(posX < threshold){
    //Farbe vor der position 120
    fill(255, 0, 0);
  }else{
    //Farbe nach der position 120
    fill(0, 0, 255);
  }

  // Zufallwert für y position
  //Framecount

// if(frameCount % 3 == 0){ // alle 3 frames
//   posY = random(height);
//   particles.push(new Particle(posX, posY, 1, 1) );
// }


   posX = posX + 1; //posX++
    posY = posY + 1;

  if (posX >= width - 50 && posY >= height - 50) { //50 ist die breite des rechtecks
    posX = 0; //posX++
    posY = 0;  

  }


}

class Particle{
	
	//constructor called when creating an instance of this class
	// x & y are the location, r is the rate of decay, a is the starting alpha value
	constructor(x,y,r,a){
		
		this.location = createVector(x,y) ;
		this.velocity = createVector(random(-1,1),random(-1,1));
		this.acceleration = createVector();
		this.alpha = this.palpha=a ;
		this.amp=3; // size of the particle
		this.rate = r;
	
	}
	
	//update the velociy and location of particle
	update(p){
		this.acceleration.add(createVector((noise(this.location.x)*2-1), (noise(this.location.y)*2-1)));
		this.velocity.add(this.acceleration);
		this.acceleration.set(0,0);
		this.location.add(this.velocity);
		this.alpha -= this.rate ;
		//this.amp-= this.rate ;
		// here is the recursion condition
		if(this.alpha<=this.palpha*0.25 && this.palpha>10) {
			p.push(new Particle(this.location.x, this.location.y, this.rate*0.25, this.palpha*0.5));
		}
	}
	
	//show the particles
	show(){
		noStroke() ;
		fill(0,35,25, this.alpha) ;
		ellipse(this.location.x, this.location.y, this.amp);
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




