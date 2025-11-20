/**
 * HandPose Boilerplate mit ml5.js
 * 
 * Dieses Sketch erkennt Hände über die Webcam und zeichnet die erkannten Keypoints.
 * Es dient als Ausgangspunkt für eigene Hand-Tracking-Projekte.
 * 
 * Dokumentation: https://docs.ml5js.org/#/reference/handpose
 * 
 * Jede Hand hat 21 Keypoints (0-20):
 * - 0: Handgelenk
 * - 1-4: Daumen
 * - 5-8: Zeigefinger
 * - 9-12: Mittelfinger
 * - 13-16: Ringfinger
 * - 17-20: Kleiner Finger
 */

// Globale Variablen
let handpose;           // Das ml5.js HandPose-Modell
let video;              // Die Webcam
let hands = [];         // Array mit allen erkannten Händen
let ratio;              // Skalierungsfaktor zwischen Video und Canvas
let isModelReady = false; // Flag, ob das Modell geladen und Hände erkannt wurden
// Kreis-Physik-Variablen
let circlePos;
let circleR = 15; // radius -> Durchmesser 30px
let vUnit = null; // Bewegungsrichtung als Einheitstektor (p5.Vector)
let initialSpeed = 0; // Startgeschwindigkeit (px/s)
let lastImpulseTime = 0; // millis() zum Start der Abbremsung
let moving = false;
let prevIndexTip = null; // vorherige Position des Zeigefinger-Tips (p5.Vector)
// Skalierung für Impuls aus Finger-Geschwindigkeit
const SPEED_SCALE = 6.0;

/**
 * Lädt das HandPose-Modell vor dem Setup
 * Diese Funktion wird automatisch vor setup() ausgeführt
 */
function preload() {
  handpose = ml5.handPose();
}

/**
 * Initialisiert Canvas und Webcam
 */
function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1); // Performanceoptimierung
  
  // Webcam einrichten
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide(); // Versteckt das Standard-Video-Element
  
  // Berechne Skalierungsfaktor für Video-zu-Canvas-Anpassung
  ratio = width / video.width;
  
  // Starte Hand-Erkennung
  handpose.detectStart(video, gotHands);

  // Initialisiere Kreis in der Mitte
  circlePos = createVector(width / 2, height / 2);
}

/**
 * Hauptzeichnungs-Loop
 */
function draw() {
  // Weißer Hintergrund mit leichtem Alpha für Trail (kleine Spur)
  noStroke();
  fill(255, 255, 255, 60); // alpha steuert Länge der Spur
  rect(0, 0, width, height);

  // Spiegle die Darstellung horizontal (für intuitivere Interaktion)
  push();
  translate(width, 0);
  scale(-1, 1);

  // Zeichne Hände (Skellet + Punkte) in Grauwerten
  if (isModelReady) {
    drawHandPoints();
  }

  // Kreis-Physik: Update und Zeichnen (im gespiegelten Raum, damit Finger-Coords passen)
  updateCircle();

  pop();
}

/**
 * Callback-Funktion für HandPose-Ergebnisse
 * Wird automatisch aufgerufen, wenn neue Hand-Daten verfügbar sind
 * 
 * @param {Array} results - Array mit erkannten Händen
 */
function gotHands(results) {
  hands = results;
  
  // Setze Flag, sobald erste Hand erkannt wurde
  if (hands.length > 0) {
    isModelReady = true;
  }
}

/**
 * Zeichnet alle erkannten Hand-Keypoints
 * Jede Hand hat 21 Keypoints (siehe Kommentar oben)
 */
function drawHandPoints() {
  // Durchlaufe alle erkannten Hände (normalerweise max. 2)
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    // Zeichne Skeleton-Linien in Grauwert
    stroke(120);
    strokeWeight(2);
    // Finger-Strukturen (jeweils von der Basis Richtung Tip)
    const fingers = [
      [0,1,2,3,4],    // Daumen
      [0,5,6,7,8],    // Zeigefinger
      [0,9,10,11,12], // Mittelfinger
      [0,13,14,15,16],// Ringfinger
      [0,17,18,19,20] // Kleiner Finger
    ];

    for (let f = 0; f < fingers.length; f++) {
      const idxs = fingers[f];
      for (let k = 0; k < idxs.length - 1; k++) {
        const a = hand.keypoints[idxs[k]];
        const b = hand.keypoints[idxs[k+1]];
        line(a.x * ratio, a.y * ratio, b.x * ratio, b.y * ratio);
      }
    }

    // Punkte in hellgrau
    noStroke();
    fill(180);
    for (let j = 0; j < hand.keypoints.length; j++) {
      let keypoint = hand.keypoints[j];
      circle(keypoint.x * ratio, keypoint.y * ratio, 8);
    }
  }
}

// Aktualisiert Position des Kreises basierend auf Finger-Input und zeichnet ihn
function updateCircle() {
  // Wenn eine Hand vorhanden ist, verwende die erste Hand
  if (hands.length > 0) {
    const hand = hands[0];
    const index = hand.keypoints[8];
    if (index) {
      const tip = createVector(index.x * ratio, index.y * ratio);

      // Berechne Finger-Geschwindigkeit (px per frame) wenn vorheriger Tipp vorhanden
      if (prevIndexTip) {
        const fingerVel = p5.Vector.sub(tip, prevIndexTip);
        const fingerSpeed = fingerVel.mag();

        // Wenn Finger den Kreis "trifft" (Nähe-Schwelle), dann apply impulse
        const dToCircle = p5.Vector.dist(tip, circlePos);
        const hitThreshold = circleR + 10; // Toleranz
        if (dToCircle <= hitThreshold && fingerSpeed > 0.1) {
          // Bewegungsrichtung: vom Finger zur Kreisposition
          vUnit = p5.Vector.sub(circlePos, tip);
          if (vUnit.mag() !== 0) vUnit.normalize();
          // Geschwindigkeit (px/s) skaliert mit Fingergeschwindigkeit
          initialSpeed = fingerSpeed * SPEED_SCALE * (60.0); // grobe Umrechnung auf px/s
          lastImpulseTime = millis();
          moving = true;
        }
      }

      // Speichere aktuellen Tip für nächsten Frame
      if (!prevIndexTip) prevIndexTip = createVector(tip.x, tip.y);
      else prevIndexTip.set(tip.x, tip.y);
    }
  } else {
    // keine Hand -> reset prev tip
    prevIndexTip = null;
  }

  // Bewegung aktualisieren (wenn aktiv)
  if (moving && vUnit) {
    const elapsed = millis() - lastImpulseTime;
    if (elapsed >= 5000) {
      // Nach 5 Sekunden Stillstand
      moving = false;
      initialSpeed = 0;
    } else {
      // Lineares Abbremsen: Geschwindigkeit sinkt auf 0 in 5s
      const currentSpeed = initialSpeed * (1 - elapsed / 5000.0);
      // deltaTime ist in ms; um px pro frame: currentSpeed * (deltaTime/1000)
      const step = vUnit.copy().mult(currentSpeed * (deltaTime / 1000.0));
      circlePos.add(step);
    }
  }

  // Bouncing an Rändern (gleicher Winkel)
  if (circlePos.x - circleR < 0) {
    circlePos.x = circleR;
    if (vUnit) vUnit.x *= -1;
  }
  if (circlePos.x + circleR > width) {
    circlePos.x = width - circleR;
    if (vUnit) vUnit.x *= -1;
  }
  if (circlePos.y - circleR < 0) {
    circlePos.y = circleR;
    if (vUnit) vUnit.y *= -1;
  }
  if (circlePos.y + circleR > height) {
    circlePos.y = height - circleR;
    if (vUnit) vUnit.y *= -1;
  }

  // Zeichne Kreis (lila, kein Stroke)
  noStroke();
  fill(128, 0, 128);
  circle(circlePos.x, circlePos.y, circleR * 2);
}

