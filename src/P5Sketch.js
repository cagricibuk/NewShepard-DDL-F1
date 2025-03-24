import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

const P5Sketch = ({ altitude, velocity, isSimulationRunning, elapsedTime, rocketImages }) => {
  const sketchRef = useRef(null);

  useEffect(() => {
    const sketch = (p) => {
      const maxAltitude = 110000;
      const visibleRange = 2000;
      let pixelsPerMeter;

      p.setup = () => {
        p.createCanvas(400, 780).parent(sketchRef.current);
        pixelsPerMeter = p.height / visibleRange;
        p.noLoop();
        p.canvas.style.visibility = 'visible';
      };

      p.draw = () => {
        if (!rocketImages) {
          p.background(0);
          p.fill(255);
          p.textSize(20);
          p.textAlign(p.CENTER, p.CENTER);
          p.text('Loading...', p.width / 2, p.height / 2);
          return;
        }

        p.background(0);
        let rocketY = altitude;
        let rocketV = velocity;
        let cameraCenterY = rocketY;

        drawRuler(cameraCenterY);
        drawRocket(cameraCenterY);

        p.fill(255);
        p.noStroke();
        p.textSize(16);
        p.textAlign(p.LEFT, p.TOP);
        p.text("Yükseklik: " + p.nf(rocketY / 1000, 1, 2) + " km", 10, 10);
        p.text("Hız: " + p.nf(rocketV, 1, 2) + " m/s", 10, 30);
      };

      const drawRuler = (cameraCenterY) => {
        // Blue Origin renk paleti
        const darkBlue = [11, 61, 145];    // #0B3D91
        const mediumBlue = [42, 100, 180];  // #2A64B4
        const lightBlue = [72, 145, 234];   // #4891EA
        
        p.strokeWeight(1);
        
        let startAlt = cameraCenterY - visibleRange / 2;
        let endAlt = cameraCenterY + visibleRange / 2;
        
        for (let i = 0; i <= maxAltitude; i += 1000) {
            if (i >= startAlt && i <= endAlt) {
                let y = p.map(i, startAlt, endAlt, p.height, 0);
                
                // Gradient çizgi çizimi
                for (let x = 0; x < p.width; x++) {
                    let inter = p.map(x, 0, p.width, 0, 1);
                    let c = p.lerpColor(
                        p.color(...darkBlue, 150),
                        p.color(...mediumBlue, 150),
                        inter
                    );
                    p.stroke(c);
                    p.line(x, y, x, y+1);
                }
                
                // Metin ve gölge efekti
                p.noStroke();
                
                // Gölge
                p.fill(0, 0, 0, 100);
                p.textSize(12);
                p.textAlign(p.LEFT, p.CENTER);
                p.text(i / 1000 + " km", 11, y+20);
                
                // Ana metin
                p.fill(...lightBlue);
                p.text(i / 1000 + " km", 10, y+20);
                
                // Özel yüksekliklerde vurgulu çizgi
                if (i % 10000 === 0) {
                    p.stroke(...lightBlue, 200);
                    p.strokeWeight(2);
                    p.line(0, y, p.width, y);
                }
            }
        }
    };

      const getRocketImageByTime = (time) => {
      
        if (time < 0) return rocketImages.default;
        if (time >= 0 && time < 143.49) return rocketImages.fire;
        if (time >= 143.49 && time < 246.6) return rocketImages.default;
        if (time >= 246.6 && time < 406.34) return rocketImages.booster;
        if (time >= 406.34) return rocketImages.deployed;
        return rocketImages.default;
      };

      const drawRocket = (cameraCenterY) => {
        let rocketScreenY = p.map(
          altitude,
          cameraCenterY - visibleRange / 2,
          cameraCenterY + visibleRange / 2,
          p.height,
          0
        );
      
        var rocketImg = getRocketImageByTime(elapsedTime);
        
        if (rocketImg) {
          p.drawingContext.drawImage(
            rocketImg,
            p.width / 2 - 30,   // X konumu (sol üst köşe)
            rocketScreenY - 60, // Y konumu (sol üst köşe)
            40,                 // genişlik
            120                 // yükseklik
          );
        }
      };
      
    };

    const p5Instance = new p5(sketch);

    return () => {
      p5Instance.remove();
    };
  }, [altitude, velocity, isSimulationRunning, elapsedTime, rocketImages]);

  return <div ref={sketchRef}></div>;
};

export default P5Sketch;
