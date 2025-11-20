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
// Farbwechsel-Logik
const colors = [ [255,0,0], [0,0,255], [0,255,0], [128,0,128], [255,215,0] ]; // rot, blau, grün, violett, gelb
let colorIndex = 0;
let leftPinchActive = false; // Debounce: true while left pinch ongoing
// Form- und Größenstatus
let shape = 'circle'; // 'circle' oder 'rect'
let diameter = 50; // startdurchmesser px
// Debounce-Flags für weitere Links-Pinch-Aktionen
let leftThumbPinkyActive = false;
let leftThumbRingActive = false;
let leftThumbMiddleActive = false;

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
}

/**
 * Hauptzeichnungs-Loop
 */
function draw() {
  background(0);

  // Spiegle die Darstellung horizontal (für intuitivere Interaktion)
  push();
  translate(width, 0);
  scale(-1, 1);

  //Zeige das Video (optional)
  //image(video, 0, 0, video.width * ratio, video.height * ratio);

  // Zeichne nur, wenn das Modell bereit ist und Hände erkannt wurden
  if (isModelReady) {
    drawHandPoints();

    // HIER KÖNNEN EIGENE/Andere ZEICHNUNGEN Oder Interaktionen HINZUGEFÜGT WERDEN
    // Zugriff auf die erste erkannte Hand
    // Wenn Hände erkannt sind: bestimme (heuristisch) rechte/ linke Hand anhand
    // der mittleren X-Position der Keypoints. Hinweis: Das ist ein einfacher
    // Heuristik-Ansatz – bei Bedarf können wir MediaPipe-Handedness verwenden.
    if (hands.length > 0) {
      let rightHand = null;
      let leftHand = null;
      if (hands.length === 1) {
        // Bei nur einer Hand behandeln wir sie als 'right' (Kreis folgt diesem Index-Tip)
        rightHand = hands[0];
      } else {
        // Zwei Hände: berechne durchschnittliche X-Position und ordne zu
        const avgX = hands.map(h => h.keypoints.reduce((s,k)=>s + k.x, 0) / h.keypoints.length * ratio);
        if (avgX[0] < avgX[1]) {
          rightHand = hands[0];
          leftHand = hands[1];
        } else {
          rightHand = hands[1];
          leftHand = hands[0];
        }
      }

      // Zeichne Objekt (Kreis oder Rechteck) am Tip des rechten Zeigefingers — variabler Durchmesser
      if (rightHand) {
        const idx = rightHand.keypoints[8];
        if (idx) {
          const cx = idx.x * ratio;
          const cy = idx.y * ratio;
          noStroke();
          const c = colors[colorIndex % colors.length];
          // 60% Transparenz
          fill(c[0], c[1], c[2], 153);
          if (shape === 'circle') {
            circle(cx, cy, diameter);
          } else {
            rectMode(CENTER);
            rect(cx, cy, diameter, diameter);
          }
        }
      }

      // Prüfe Pinch (Kontakt) an der linken Hand: Zeigefinger-Tip (8) mit Daumen-Tip (4)
      if (leftHand) {
        const lIndex = leftHand.keypoints[8];
        const lThumb = leftHand.keypoints[4];
        const lPinky = leftHand.keypoints[20];
        const lRing = leftHand.keypoints[16];
        const lMiddle = leftHand.keypoints[12];

        // Berechne Daumen-Koordinaten, falls vorhanden
        let tx = null, ty = null;
        if (lThumb) {
          tx = lThumb.x * ratio;
          ty = lThumb.y * ratio;
        }

        // a) Index-Thumb pinch -> Farbe wechseln (debounced)
        if (lIndex && lThumb) {
          const ix = lIndex.x * ratio;
          const iy = lIndex.y * ratio;
          const d = dist(ix, iy, tx, ty);
          const pinchThreshold = 28; // px Schwellwert – passend zur 30px Größe

          if (d <= pinchThreshold && !leftPinchActive) {
            colorIndex = (colorIndex + 1) % colors.length;
            leftPinchActive = true;
          } else if (d > pinchThreshold + 8) {
            leftPinchActive = false;
          }
        }

        // 1) Wenn linker Daumen und linker Kleiner Finger sich berühren -> Toggle Form (debounced)
        if (lThumb && lPinky) {
          const px = lPinky.x * ratio;
          const py = lPinky.y * ratio;
          const dTP = dist(tx, ty, px, py);
          const throat = 28;
          if (dTP <= throat && !leftThumbPinkyActive) {
            // Toggle zwischen rect und circle
            shape = (shape === 'rect') ? 'circle' : 'rect';
            leftThumbPinkyActive = true;
          } else if (dTP > throat + 8) {
            // Finger weit genug auseinander: reset debounce
            leftThumbPinkyActive = false;
          }
        }

        // 2) Wenn linker Ringfinger-Tip den linken Daumen berührt -> Objekt -10px (debounced)
        if (lThumb && lRing) {
          const rx = lRing.x * ratio;
          const ry = lRing.y * ratio;
          const dTR = dist(tx, ty, rx, ry);
          const changeThreshold = 28;
          if (dTR <= changeThreshold && !leftThumbRingActive) {
            diameter = max(10, diameter - 10);
            leftThumbRingActive = true;
          } else if (dTR > changeThreshold + 8) {
            leftThumbRingActive = false;
          }
        }

        // 3) Wenn linker Mittelfinger-Tip den linken Daumen berührt -> Objekt +10px (debounced)
        if (lThumb && lMiddle) {
          const mx = lMiddle.x * ratio;
          const my = lMiddle.y * ratio;
          const dTM = dist(tx, ty, mx, my);
          const changeThreshold = 28;
          if (dTM <= changeThreshold && !leftThumbMiddleActive) {
            diameter = diameter + 10;
            leftThumbMiddleActive = true;
          } else if (dTM > changeThreshold + 8) {
            leftThumbMiddleActive = false;
          }
        }
      }
    }
  }

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

    // Durchlaufe alle 21 Keypoints einer Hand
    for (let j = 0; j < hand.keypoints.length; j++) {
      let keypoint = hand.keypoints[j];

      // Zeichne Keypoint als grüner Kreis
      fill(0, 255, 0);
      noStroke();
      circle(keypoint.x * ratio, keypoint.y * ratio, 10);
    }
  }
}

