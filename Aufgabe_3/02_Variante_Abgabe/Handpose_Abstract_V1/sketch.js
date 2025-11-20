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
let fingerWidthCache = {}; // Cache für Random-Breiten pro Linienpaar

// 5 kräftige Pastellfarben (höhere Sättigung)
const colorPalette = [
  [255, 100, 130],   // 0: Kräftiges Rosérot
  [255, 180, 100],   // 1: Kräftiges Pfirsich
  [255, 240, 80],    // 2: Kräftiges Zitron
  [120, 210, 200],   // 3: Kräftiges Mintgrün
  [200, 150, 220]    // 4: Kräftiges Lavendel
];

// Farb-Zuordnungen pro Form (2 Farben pro Form)
const shapeColors = {
  0: [0, 1],  // Rechteck: Rosérot, Pfirsich
  1: [2, 3],  // Ellipse: Zitron, Mintgrün
  2: [4, 0]   // Dreieck: Lavendel, Rosérot
};

// Hand-spezifische Zustände (pro Hand)
let handState = {
  Left: {
    isFist: false,
    lastFistState: false,
    shapeMode: 0,           // 0 = Rechteck, 1 = Ellipse, 2 = Dreieck (für Handballen)
    palmShapeMode: 0,       // 0 = Rechteck, 1 = Ellipse, 2 = Dreieck für Handballen
    isVerticalShift: false,
    lastVerticalShiftState: false,
    objectColor: [255, 100, 130], // Kräftiges Rosérot (Anfang)
    fingerWidth: 40,        // Wird in setup() initialisiert (20-60)
    palmWidth: 40,          // Wird in setup() initialisiert (20-60)
    fingerShapes: [],       // Array mit 14 zufällige Formen (0/1/2) für Finger-Objekte
    shapeColorIndices: [0, 0, 0]  // Color-Index pro Form [rect, ellipse, triangle] - wechselt bei Hand-Drehung
  },
  Right: {
    isFist: false,
    lastFistState: false,
    shapeMode: 0,           // 0 = Rechteck, 1 = Ellipse, 2 = Dreieck (für Handballen)
    palmShapeMode: 0,       // 0 = Rechteck, 1 = Ellipse, 2 = Dreieck für Handballen
    isVerticalShift: false,
    lastVerticalShiftState: false,
    objectColor: [255, 180, 100], // Kräftiges Pfirsich (Anfang)
    fingerWidth: 40,        // Wird in setup() initialisiert (20-60)
    palmWidth: 40,          // Wird in setup() initialisiert (20-60)
    fingerShapes: [],       // Array mit 14 zufällige Formen (0/1/2) für Finger-Objekte
    shapeColorIndices: [0, 0, 0]  // Color-Index pro Form [rect, ellipse, triangle] - wechselt bei Hand-Drehung
  }
};

/**
 * OPTION 1: Durchschnittliche Distanz zwischen Finger-Tips
 * Faust erkannt, wenn Finger nah beieinander sind
 */
function detectFist_Option1(hand) {
  const tips = [4, 8, 12, 16, 20].map(idx => hand.keypoints[idx]);
  let totalDist = 0;
  let count = 0;
  for (let i = 0; i < tips.length; i++) {
    for (let j = i + 1; j < tips.length; j++) {
      if (tips[i] && tips[j]) {
        totalDist += dist(tips[i].x, tips[i].y, tips[j].x, tips[j].y);
        count++;
      }
    }
  }
  const avgDist = count > 0 ? totalDist / count : 1000;
  return avgDist < 50; // Schwelle: 50px
}

/**
 * OPTION 2: Distanz von Finger-Tips zum Handgelenk
 * Faust erkannt, wenn alle Finger-Tips dicht am Handgelenk sind
 */
function detectFist_Option2(hand) {
  const wrist = hand.keypoints[0];
  const tips = [4, 8, 12, 16, 20].map(idx => hand.keypoints[idx]);
  
  if (!wrist) return false;
  
  let totalDistToWrist = 0;
  let validTips = 0;
  for (let tip of tips) {
    if (tip) {
      totalDistToWrist += dist(wrist.x, wrist.y, tip.x, tip.y);
      validTips++;
    }
  }
  
  const avgDistToWrist = validTips > 0 ? totalDistToWrist / validTips : 1000;
  return avgDistToWrist < 60; // Schwelle: 60px vom Handgelenk
}

/**
 * OPTION 3: Bounding Box Größe der Finger-Tips
 * Faust erkannt, wenn Finger-Tips in kleine Bounding Box passen
 */
function detectFist_Option3(hand) {
  const tips = [4, 8, 12, 16, 20].map(idx => hand.keypoints[idx]).filter(t => t);
  
  if (tips.length === 0) return false;
  
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  for (let tip of tips) {
    minX = min(minX, tip.x);
    maxX = max(maxX, tip.x);
    minY = min(minY, tip.y);
    maxY = max(maxY, tip.y);
  }
  
  const boxWidth = maxX - minX;
  const boxHeight = maxY - minY;
  const boxArea = boxWidth * boxHeight;
  
  return boxArea < 3000; // Schwelle: 3000px² (small box)
}

/**
 * OPTION 4: PIP-Knöchel zu Tip Distanz Verhältnis
 * Faust erkannt, wenn Finger-PIP nah bei Tips sind (gekrümmt)
 */
function detectFist_Option4(hand) {
  // Finger-Struktur: [tip, pip, mcp, cmc/base] pro Finger
  const fingerPairs = [
    { tip: 4, pip: 3 },   // Daumen: 4 (tip), 3 (pip)
    { tip: 8, pip: 7 },   // Index: 8, 7
    { tip: 12, pip: 11 }, // Mitte: 12, 11
    { tip: 16, pip: 15 }, // Ring: 16, 15
    { tip: 20, pip: 19 }  // Pinky: 20, 19
  ];
  
  let totalCurvature = 0;
  let validFingers = 0;
  
  for (let pair of fingerPairs) {
    const tip = hand.keypoints[pair.tip];
    const pip = hand.keypoints[pair.pip];
    
    if (tip && pip) {
      const tipPipDist = dist(tip.x, tip.y, pip.x, pip.y);
      totalCurvature += tipPipDist;
      validFingers++;
    }
  }
  
  const avgCurvature = validFingers > 0 ? totalCurvature / validFingers : 1000;
  return avgCurvature < 20; // Schwelle: 20px (Finger stark gekrümmt)
}

/**
 * OPTION 5: Hybrid - Kombination aus Distanz + Bounding Box
 * Faust erkannt, wenn BEIDE Kriterien erfüllt sind
 */
function detectFist_Option5(hand) {
  // Kriterium 1: Durchschnittliche Distanz zwischen Tips < 50px
  const tips = [4, 8, 12, 16, 20].map(idx => hand.keypoints[idx]).filter(t => t);
  let totalDist = 0;
  let count = 0;
  for (let i = 0; i < tips.length; i++) {
    for (let j = i + 1; j < tips.length; j++) {
      totalDist += dist(tips[i].x, tips[i].y, tips[j].x, tips[j].y);
      count++;
    }
  }
  const avgDist = count > 0 ? totalDist / count : 1000;
  
  // Kriterium 2: Bounding Box klein < 3000px²
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  for (let tip of tips) {
    minX = min(minX, tip.x);
    maxX = max(maxX, tip.x);
    minY = min(minY, tip.y);
    maxY = max(maxY, tip.y);
  }
  const boxArea = (maxX - minX) * (maxY - minY);
  
  return avgDist < 50 && boxArea < 3000; // BEIDE Bedingungen müssen erfüllt sein
}

/**
 * Aktuelle Fist-Erkennungs-Funktion (verwendet Option 1)
 * Wechsel zu einer anderen Option durch Umbenennung
 */
function detectFist(hand) {
  return detectFist_Option1(hand);
}

/**
 * Erkennt vertikale Finger-Verschiebung: wenn Finger vertikal wechseln, aber horizontal gleich bleiben
 */
function detectVerticalShift(hand) {
  const ellipsenIndizes = [5, 9, 13, 17, 2, 1, 0];
  let minY = Infinity, maxY = -Infinity;
  let minX = Infinity, maxX = -Infinity;

  for (let idx of ellipsenIndizes) {
    const kp = hand.keypoints[idx];
    if (kp) {
      minY = min(minY, kp.y);
      maxY = max(maxY, kp.y);
      minX = min(minX, kp.x);
      maxX = max(maxX, kp.x);
    }
  }

  const verticalSpan = maxY - minY;
  const horizontalSpan = maxX - minX;

  // Vertikale Verschiebung erkannt: wenn vertikal groß aber horizontal klein bleibt
  return verticalSpan > 50 && horizontalSpan < 40;
}

/**
 * Generiert 14 zufällige Formen für die Finger-Objekte (0=Rect, 1=Ellipse, 2=Triangle)
 */
function generateRandomFingerShapes() {
  const shapes = [];
  for (let i = 0; i < 14; i++) {
    shapes.push(floor(random(3))); // 0, 1, oder 2
  }
  return shapes;
}

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

  // Initialisiere random fingerWidth, palmWidth und Finger-Formen für beide Hände
  handState.Left.fingerWidth = random(40, 80);
  handState.Right.fingerWidth = random(40, 80);
  handState.Left.palmWidth = random(40, 80);
  handState.Right.palmWidth = random(40, 80);
  handState.Left.fingerShapes = generateRandomFingerShapes();
  handState.Right.fingerShapes = generateRandomFingerShapes();

  // Starte Hand-Erkennung
  handpose.detectStart(video, gotHands);
}

/**
 * Hauptzeichnungs-Loop
 */
function draw() {
  background(0, 80);


  // Spiegle die Darstellung horizontal (für intuitivere Interaktion)
  push();
  translate(width, 0);
  scale(-1, 1);

  //Zeige das Video (optional)
  //image(video, 0, 0, video.width * ratio, video.height * ratio);

  // Zeichne nur, wenn das Modell bereit ist und Hände erkannt wurden
  if (isModelReady) {
    drawHandPoints();
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
 * Zeichnet alle erkannten Hand-Keypoints mit Finger-Objekten und einer Bounding-Ellipse
 * Jede Hand hat 21 Keypoints (siehe Kommentar oben)
 */
function drawHandPoints() {
  // Durchlaufe alle erkannten Hände (normalerweise max. 2)
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    const handedness = hand.handedness; // "Left" oder "Right"
    const state = handState[handedness]; // Hole den State für diese Hand

    // Erkenne vertikale Finger-Verschiebung und wechsle Farb-Indizes pro Form
    const currentVerticalShift = detectVerticalShift(hand);
    if (currentVerticalShift && !state.lastVerticalShiftState) {
      // Neue Verschiebung erkannt -> Farb-Indizes pro Form weiterwechseln
      for (let shapeIdx = 0; shapeIdx < 3; shapeIdx++) {
        state.shapeColorIndices[shapeIdx] = (state.shapeColorIndices[shapeIdx] + 1) % 2; // 0 oder 1
      }
    }
    state.lastVerticalShiftState = currentVerticalShift;
    state.isVerticalShift = currentVerticalShift;

    // Erkenne Faust und wechsle Form erst beim Öffnen (aber nur wenn nicht in vertikalem Shift)
    const currentFist = detectFist(hand);
    if (!state.isVerticalShift) {
      if (!currentFist && state.lastFistState) {
        // Faust wird gerade geöffnet -> Shape-Mode wechseln UND neue fingerWidth berechnen (KEIN Farbwechsel!)
        state.shapeMode = (state.shapeMode + 1) % 3; // 0 -> 1 -> 2 -> 0
        state.palmShapeMode = (state.palmShapeMode + 1) % 3; // Auch Handballen Form wechseln
        state.fingerWidth = random(40, 80);; // Neue synchrone Breite für ALLE Finger dieser Hand (20-60)
        state.palmWidth = random(40, 80); // Neue Handballen-Breite (20-60)
        state.fingerShapes = generateRandomFingerShapes(); // Finger-Formen neu randomisieren
      }
      state.lastFistState = currentFist;
    } else {
      // Während vertikalem Shift: ignoriere Faust-Trigger
      state.lastFistState = currentFist;
    }
    state.isFist = currentFist;

    // Berechne Bounding-Box nur für spezifische Keypoints (Handballen-Region)
    const ellipsenIndizes = [5, 9, 13, 17, 2, 1, 0];
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    for (let idx of ellipsenIndizes) {
      const kp = hand.keypoints[idx];
      if (kp) {
        const x = kp.x * ratio;
        const y = kp.y * ratio;
        minX = min(minX, x);
        maxX = max(maxX, x);
        minY = min(minY, y);
        maxY = max(maxY, y);
      }
    }

    // Zeichne Handballen-Objekt (statt Ellipse) mit den Dimensionen der Bounding-Box
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const bboxWidth = (maxX - minX) * 1.0;
    const bboxHeight = (maxY - minY) * 1.0;

    noStroke();
    fill(state.objectColor[0], state.objectColor[1], state.objectColor[2], 20); // 50% Transparenz

    push();
    translate(centerX, centerY);

    // Zeichne Handballen-Objekt basierend auf palmShapeMode (hand-spezifisch)
    if (state.palmShapeMode === 0) {
      // Rechteck
      rect(-bboxWidth / 2, -bboxHeight / 2, bboxWidth, bboxHeight);
    } else if (state.palmShapeMode === 1) {
      // Ellipse
      ellipse(0, 0, bboxWidth, bboxHeight);
    } else if (state.palmShapeMode === 2) {
      // Dreieck: Spitze nach unten (variiert mit bboxWidth/Height als Basis)
      const halfWidth = bboxWidth / 2;
      const halfHeight = bboxHeight / 2;
      triangle(
        0, -halfHeight,           // Spitze oben
        halfWidth, halfHeight,    // Basis unten rechts
        -halfWidth, halfHeight    // Basis unten links
      );
    }

    pop();

    // Zeichne Finger-Objekte zwischen Keypoints
    const linienPaare = [
      [4, 3], [3, 2],           // Daumen
      [8, 7], [7, 6], [6, 5],   // Zeigefinger
      [12, 11], [11, 10], [10, 9], // Mittelfinger
      [16, 15], [15, 14], [14, 13], // Ringfinger
      [20, 19], [19, 18], [18, 17]  // Kleiner Finger
    ];

    noStroke();

    for (let pairIndex = 0; pairIndex < linienPaare.length; pairIndex++) {
      const pair = linienPaare[pairIndex];
      const p1 = hand.keypoints[pair[0]];
      const p2 = hand.keypoints[pair[1]];
      if (p1 && p2) {
        const x1 = p1.x * ratio;
        const y1 = p1.y * ratio;
        const x2 = p2.x * ratio;
        const y2 = p2.y * ratio;

        // Berechne Richtungsvektor von p1 zu p2
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist_p1_p2 = dist(x1, y1, x2, y2);
        
        // Normalisiere Richtungsvektor
        const dirX = dx / dist_p1_p2;
        const dirY = dy / dist_p1_p2;
        
        // Verlängere um 20% in beide Richtungen
        const extensionLength = dist_p1_p2 * 0.20;
        const extendedX1 = x1 - dirX * extensionLength;
        const extendedY1 = y1 - dirY * extensionLength;
        const extendedX2 = x2 + dirX * extensionLength;
        const extendedY2 = y2 + dirY * extensionLength;

        // Mittelpunkt der verlängerten Linie
        const cx = (extendedX1 + extendedX2) / 2;
        const cy = (extendedY1 + extendedY2) / 2;

        // Länge der verlängerten Linie
        const len = dist(extendedX1, extendedY1, extendedX2, extendedY2);

        // Zufallsbreite aus Hand-State verwenden (synchron für alle Finger)
        const fingerWidth = state.fingerWidth;

        // Hole die individuelle Form für diesen Finger
        const fingerShape = state.fingerShapes[pairIndex];
        
        // Hole die passende Farbe basierend auf Form und aktuellem Color-Index
        const colorIndicesForShape = shapeColors[fingerShape];
        const colorIndexForThisShape = state.shapeColorIndices[fingerShape];
        const colorPaletteIndex = colorIndicesForShape[colorIndexForThisShape];
        const fingerColor = colorPalette[colorPaletteIndex];
        
        fill(fingerColor[0], fingerColor[1], fingerColor[2], 100); // ~70% Transparenz

        // Winkel der Linie
        const angle = atan2(extendedY2 - extendedY1, extendedX2 - extendedX1);

        push();
        translate(cx, cy);
        rotate(angle);

        // Zeichne Finger-Objekt basierend auf fingerShape (zufällig pro Finger)
        if (fingerShape === 0) {
          // Rechteck
          rect(-len / 2, -fingerWidth / 2, len, fingerWidth);
        } else if (fingerShape === 1) {
          // Ellipse mit verlängerter Länge
          ellipse(0, 0, len, fingerWidth);
        } else if (fingerShape === 2) {
          // Dreieck: Spitze nach hinten (180° gedreht), Grundlinie vorne
          // Spitze ist hinten auf der Fingerlinie (-len/2)
          // Grundlinie ist vorne (len/2) mit Breite fingerWidth
          triangle(
            -len / 2, 0,              // Spitze (hinten auf Fingerlinie)
            len / 2, -fingerWidth / 2,   // Grundlinie vorne oben
            len / 2, fingerWidth / 2     // Grundlinie vorne unten
          );
        }

        pop();
      }
    }

    // Zeichne Keypoints als graue Kreise (oben drüber)
    for (let j = 0; j < hand.keypoints.length; j++) {
      let keypoint = hand.keypoints[j];
      if (!keypoint) continue; // Null-Check

      // Zeichne Keypoint als grauer Kreis
      fill(150);
      noStroke();
      circle(keypoint.x * ratio, keypoint.y * ratio, 6);
    }
  }
}

