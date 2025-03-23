import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

const P5Sketch = ({ altitude, velocity, isSimulationRunning }) => {
  const sketchRef = useRef(null);

  useEffect(() => {
    const sketch = (p) => {
      const maxAltitude = 100000; // 100 km
      const visibleRange = 5000; // 5 km'lik görüntü alanı
      let pixelsPerMeter;

      p.setup = () => {
        p.createCanvas(400, 600).parent(sketchRef.current);
        pixelsPerMeter = p.height / visibleRange; // ekrana 5 km sığacak şekilde oran
      };

      p.draw = () => {
        p.background(0);

        // Roketin yüksekliğini ve hızını React state'inden al
        let rocketY = altitude; // Yükseklik
        let rocketV = velocity; // Hız

        // Kameranın takip edeceği offset (roket ekranın ortasında olacak şekilde)
        let cameraCenterY = rocketY;

        drawRuler(cameraCenterY);
        drawRocket(cameraCenterY);

        // Yükseklik ve hız bilgisi
        p.fill(255);
        p.noStroke();
        p.textSize(16);
        p.textAlign(p.LEFT, p.TOP);
        p.text("Yükseklik: " + p.nf(rocketY / 1000, 1, 2) + " km", 10, 10);
        p.text("Hız: " + p.nf(rocketV, 1, 2) + " m/s", 10, 30);

        if (rocketY >= maxAltitude) {
          p.noLoop();
          p.textSize(32);
          p.textAlign(p.CENTER, p.CENTER);
          p.text("100 km'ye ulaşıldı!", p.width / 2, p.height / 2);
        }
      };

      const drawRuler = (cameraCenterY) => {
        p.stroke(150);
        p.strokeWeight(1);
        let startAlt = cameraCenterY - visibleRange / 2;
        let endAlt = cameraCenterY + visibleRange / 2;
        for (let i = 0; i <= maxAltitude; i += 1000) { // her 1 km çizgi
          if (i >= startAlt && i <= endAlt) {
            let y = p.map(i, startAlt, endAlt, p.height, 0);
            p.line(0, y, p.width, y);
            p.noStroke();
            p.fill(150);
            p.textSize(12);
            p.textAlign(p.LEFT, p.CENTER);
            p.text(i / 1000 + " km", 5, y);
            p.stroke(150);
          }
        }
      };

      const drawRocket = (cameraCenterY) => {
        let rocketScreenY = p.map(altitude, cameraCenterY - visibleRange / 2, cameraCenterY + visibleRange / 2, p.height, 0);
        p.fill(255, 0, 0);
        p.noStroke();
        p.rect(p.width / 2 - 5, rocketScreenY - 30, 10, 30); // gövde
        p.fill(255, 165, 0);
        p.triangle(
          p.width / 2 - 5,
          rocketScreenY,
          p.width / 2 + 5,
          rocketScreenY,
          p.width / 2,
          rocketScreenY + 20
        ); // alev
      };
    };

    const p5Instance = new p5(sketch);

    // Temizleme fonksiyonu
    return () => {
      p5Instance.remove();
    };
  }, [altitude, velocity, isSimulationRunning]); // Prop'lar değiştiğinde yeniden render et

  return <div ref={sketchRef}></div>;
};

export default P5Sketch;