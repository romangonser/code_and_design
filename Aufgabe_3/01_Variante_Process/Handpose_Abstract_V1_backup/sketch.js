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

// 6 verfügbare Farben
const colorPalette = [
  [255, 0, 0],       // Rot
  [0, 255, 0],       // Grün
  [0, 0, 255],       // Blau
  [255, 255, 0],     // Gelb
  [255, 0, 255],     // Magenta
  [0, 255, 255]      // Cyan
];

// Hand-spezifische Zustände (pro Hand)
let handState = {
  Left: {
    isFist: false,
    lastFistState: false,
    shapeMode: 0,           // 0 = Rechteck, 1 = Ellipse, 2 = Dreieck
    isVerticalShift: false,
    lastVerticalShiftState: false,
    colorIndex: 0,          // Index in colorPalette (0-5)
    objectColor: [255, 0, 0] // Rot (Anfang)
  },
  Right: {
    isFist: false,
    lastFistState: false,
    shapeMode: 0,           // 0 = Rechteck, 1 = Ellipse, 2 = Dreieck
    isVerticalShift: false,
    lastVerticalShiftState: false,
    colorIndex: 1,          // Andere Farbe starten (Grün)
    objectColor: [0, 255, 0] // Grün (Anfang)
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

    // Erkenne vertikale Finger-Verschiebung und toggle Farbe
    const currentVerticalShift = detectVerticalShift(hand);
    if (currentVerticalShift && !state.lastVerticalShiftState) {
      // Neue Verschiebung erkannt -> Farbe togglen
      state.objectColor = state.objectColor[0] === 255 && state.objectColor[1] === 255 ? [255, 0, 0] : [255, 255, 0];
    }
    state.lastVerticalShiftState = currentVerticalShift;
    state.isVerticalShift = currentVerticalShift;

    // Erkenne Faust und wechsle Form erst beim Öffnen (aber nur wenn nicht in vertikalem Shift)
    const currentFist = detectFist(hand);
    if (!state.isVerticalShift) {
      if (!currentFist && state.lastFistState) {
        // Faust wird gerade geöffnet -> Farbe zyklisch wechseln UND Shape-Mode wechseln
        state.colorIndex = (state.colorIndex + 1) % colorPalette.length; // 0-5
        state.objectColor = [...colorPalette[state.colorIndex]];
        state.shapeMode = (state.shapeMode + 1) % 3; // 0 -> 1 -> 2 -> 0
        
        // Cache für Breiten dieser Hand zurücksetzen, damit neue Breiten berechnet werden
        for (let key in fingerWidthCache) {
          if (key.startsWith(handedness)) {
            delete fingerWidthCache[key];
          }
        }
      }
      state.lastFistState = currentFist;
    } else {
      // Während vertikalem Shift: ignoriere Faust-Trigger
      state.lastFistState = currentFist;
    }
    state.isFist = currentFist;

    // Berechne Bounding-Box nur für spezifische Keypoints
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

    // Zeichne eine Ellipse mit den Dimensionen der Bounding-Box
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const width = (maxX - minX) * 1.0;
    const height = (maxY - minY) * 1.0;

    noStroke();
    fill(state.objectColor[0], state.objectColor[1], state.objectColor[2], 100); // Hand-spezifische Farbe
    ellipse(centerX, centerY, width, height);

    // Zeichne Finger-Objekte zwischen Keypoints
    const linienPaare = [
      [4, 3], [3, 2],           // Daumen
      [8, 7], [7, 6], [6, 5],   // Zeigefinger
      [12, 11], [11, 10], [10, 9], // Mittelfinger
      [16, 15], [15, 14], [14, 13], // Ringfinger
      [20, 19], [19, 18], [18, 17]  // Kleiner Finger
    ];

    noStroke();
    fill(state.objectColor[0], state.objectColor[1], state.objectColor[2], 127); // 50% Transparenz

    for (let pair of linienPaare) {
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

        // Zufallsbreite aus Cache oder neu berechnen
        // Nach Faust-Öffnen: Cache ist leer, daher werden neue Breiten berechnet
        // Während Faust oder Shift: neue Breiten werden nicht berechnet
        const pairKey = handedness + '-' + pair[0] + '-' + pair[1]; // Hand-spezifischer Key
        if (!state.isFist && !state.isVerticalShift && !fingerWidthCache[pairKey]) {
          fingerWidthCache[pairKey] = random(15, 30); // Neue Breite berechnen und cachen
        }
        const fingerWidth = fingerWidthCache[pairKey] || random(15, 30);

        // Winkel der Linie
        const angle = atan2(extendedY2 - extendedY1, extendedX2 - extendedX1);

        push();
        translate(cx, cy);
        rotate(angle);

        // Zeichne Finger-Objekt basierend auf shapeMode (hand-spezifisch)
        if (state.shapeMode === 0) {
          // Rechteck
          rect(-len / 2, -fingerWidth / 2, len, fingerWidth);
        } else if (state.shapeMode === 1) {
          // Ellipse mit verlängerter Länge
          ellipse(0, 0, len, fingerWidth);
        } else if (state.shapeMode === 2) {
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

