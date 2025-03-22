import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Önemli olayların listesi
const events = [
  { name: 'Ignition', time: 0, altitude: 1118 },
  { name: 'Liftoff', time: 7.26, altitude: 1118 },
  { name: 'Max Q', time: 60, altitude: 15000 }, // Örnek değer
  { name: 'MECO', time: 143.49, altitude: 56281 },
  { name: 'Apogee', time: 246.6, altitude: 106744 },
  { name: 'Deploy Brakes', time: 406.34, altitude: 6184 },
  { name: 'Restart Ignition', time: 425.31, altitude: 2201 },
  { name: 'Touchdown', time: 447.83, altitude: 1116 },
];

function App() {
  const [flightData, setFlightData] = useState([]); // Tüm veriler
  const [simulationData, setSimulationData] = useState([]); // Simülasyon verileri
  const [isSimulationRunning, setIsSimulationRunning] = useState(false); // Simülasyon durumu
  const [countdown, setCountdown] = useState('T - 50'); // Geri sayım (T - X formatında)
  const [progress, setProgress] = useState(0); // Progress bar doluluk oranı
  const currentIndexRef = useRef(0); // Mevcut veri indeksi (useRef kullanıyoruz)
  const startTimeRef = useRef(null); // Simülasyon başlangıç zamanı (useRef kullanıyoruz)
  const requestRef = useRef(); // requestAnimationFrame referansı

  useEffect(() => {
    // JSON verisini yükle
    fetch('/flight_data.json')
      .then((response) => response.json())
      .then((data) => {
        setFlightData(data);
      })
      .catch((error) => console.error('Error loading JSON:', error));
  }, []);

  const updateSimulation = (timestamp) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp; // Simülasyon başlangıç zamanını kaydet
    }

    // Geçen süreyi hesapla (milisaniye cinsinden)
    const elapsedTime = timestamp - startTimeRef.current;

    // Şu anki zamanı hesapla (saniye cinsinden)
    const currentTime = -50 + elapsedTime / 1000;

    // Şu anki zamanı tam saniyeye yuvarla
    const currentSecond = Math.floor(currentTime);

    // Geri sayımı güncelle (T - X formatında)
    setCountdown(`T - ${Math.abs(currentSecond)}`);

    // Progress bar doluluk oranını güncelle
    const progressPercentage = ((currentTime + 50) / 500) * 100; // -50 ile 450 arasında
    setProgress(progressPercentage);

    // Şu anki zaman aralığındaki verileri bul
    while (
      currentIndexRef.current < flightData.length &&
      flightData[currentIndexRef.current].flight_time_seconds <= currentTime
    ) {
      setSimulationData((prevData) => [...prevData, flightData[currentIndexRef.current]]);
      currentIndexRef.current += 1;
    }

    // Simülasyon devam ediyorsa, bir sonraki kareyi planla
    if (currentTime <= 450) {
      requestRef.current = requestAnimationFrame(updateSimulation);
    } else {
      setIsSimulationRunning(false); // Simülasyonu durdur
    }
  };

  useEffect(() => {
    if (isSimulationRunning) {
      // Simülasyon başlatıldığında, requestAnimationFrame ile güncellemeleri başlat
      requestRef.current = requestAnimationFrame(updateSimulation);
    } else {
      // Simülasyon durdurulduğunda, requestAnimationFrame'i temizle
      cancelAnimationFrame(requestRef.current);
    }

    // Temizleme fonksiyonu
    return () => cancelAnimationFrame(requestRef.current);
  }, [isSimulationRunning]);

  // Velocity ve Altitude değerlerini hesapla
  const currentVelocity = simulationData.length > 0 ? simulationData[simulationData.length - 1].velocity : 0;
  const currentAltitude = simulationData.length > 0 ? simulationData[simulationData.length - 1].altitude : 0;

  return (
    <div style={{ backgroundColor: '#464747', color: '#FFFFFF', minHeight: '100vh', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Navbar Benzeri Üst Kısım */}
      <div style={{ display: 'flex',justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '10px', backgroundColor: '#333333', borderRadius: '10px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#0000FF', marginBottom: '5px' }}>Velocity</h3>
            <div style={{ fontSize: '20px', color: '#FFFFFF' }}>{currentVelocity.toFixed(2)} m/s</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#0000FF', marginBottom: '5px' }}>Altitude</h3>
            <div style={{ fontSize: '20px', color: '#FFFFFF' }}>{currentAltitude.toFixed(2)} m</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#0000FF', marginBottom: '5px' }}>Timer</h3>
            <div style={{ fontSize: '20px', color: '#FFFFFF' }}>{countdown}</div>
          </div>
        </div>
        <button
          onClick={() => {
            setIsSimulationRunning(true); // Simülasyonu başlat
            setSimulationData([]); // Verileri sıfırla
            currentIndexRef.current = 0; // İndeksi sıfırla
            startTimeRef.current = null; // Başlangıç zamanını sıfırla
            setCountdown('T - 50'); // Geri sayımı sıfırla
            setProgress(0); // Progress bar'ı sıfırla
          }}
          disabled={isSimulationRunning} // Simülasyon çalışırken butonu devre dışı bırak
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#0000FF',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          {isSimulationRunning ? 'Simülasyon Çalışıyor...' : 'Simülasyonu Başlat'}
        </button>
      </div>

      {/* Ana Yerleşim */}
      <div style={{ display: 'flex', gap: '20px', height: '80vh' }}>
        {/* Sol Taraf: Dikey Progress Bar */}
        <div style={{ width: '10%', backgroundColor: '#333333', padding: '20px', borderRadius: '10px' }}>
          <div style={{ height: '100%', width: '20px', backgroundColor: '#555555', borderRadius: '10px', position: 'relative' }}>
            <div
              style={{
                height: `${progress}%`, // Doluluk oranı
                width: '100%',
                backgroundColor: '#0000FF',
                borderRadius: '10px',
                position: 'absolute',
                bottom: 0, // Aşağıdan yukarıya dolacak
              }}
            />
            {events.map((event, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  bottom: `${((event.time + 50) / 500) * 100}%`, // Olayın zamanına göre konumlandır
                  left: '100%',
                  marginLeft: '10px',
                  whiteSpace: 'nowrap',
                  fontSize: '12px',
                  color: '#FFFFFF',
                }}
              >
                {event.name} ({event.time}s)
              </div>
            ))}
          </div>
        </div>

        {/* Orta: 3D Simülasyon */}
        <div style={{ flex: 1, backgroundColor: '#333333', padding: '20px', borderRadius: '10px', position: 'relative' }}>
         <div style={{ height: '100%', backgroundColor: '#555555', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
            3D Visualization Placeholder
          </div>

          {/* Grafikler (Simülasyon Üzerinde Layer Olarak) */}
          <div style={{ position: 'absolute', bottom: 0, left: 20, right: 20, backgroundColor: 'rgba(70, 70, 70, 0.8)', padding: '20px', borderRadius: '10px', display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
            <h3 style={{ color: '#0000FF', marginBottom: '10px' }}>Altitude vs. Time</h3>
              
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={simulationData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#555555" />
                  <XAxis
                    dataKey="flight_time_seconds"
                    type="number"
                    domain={[-50, 450]}
                    ticks={[-50, 0, 50, 100, 150, 200, 250, 300, 350, 400, 450]}
                    tick={{ fill: '#FFFFFF' }}
                    label={{ value: 'Flight Time (seconds)', position: 'insideBottom', offset: -20, fill: '#FFFFFF' }}
                  />
                  <YAxis
                    domain={[0, 100000]}
                    tick={{ fill: '#FFFFFF' }}
                    label={{ value: 'Altitude AGL (meters)', angle: -90, position: 'insideLeft', offset: 60, fill: '#FFFFFF' }}
                  />
                  <Tooltip contentStyle={{ backgroundColor: '#333333', color: '#FFFFFF' }} />
                  <Legend wrapperStyle={{ color: '#FFFFFF' }} />
                  <Line
                    type="monotone"
                    dataKey="altitude"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={false}
                    name="Altitude"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: '#0000FF', marginBottom: '10px' }}>Velocity vs. Time</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={simulationData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#555555" />
                  <XAxis
                    dataKey="flight_time_seconds"
                    type="number"
                    domain={[-50, 450]}
                    ticks={[-50, 0, 50, 100, 150, 200, 250, 300, 350, 400, 450]}
                    tick={{ fill: '#FFFFFF' }}
                    label={{ value: 'Flight Time (seconds)', position: 'insideBottom', offset: -20, fill: '#FFFFFF' }}
                  />
                  <YAxis
                    domain={[0, 1000]}
                    ticks={[0, 500, 1000]}
                    tick={{ fill: '#FFFFFF' }}
                    label={{ value: 'Velocity (m/s)', angle: -90, position: 'insideLeft', offset: 60, fill: '#FFFFFF' }}
                  />
                  <Tooltip contentStyle={{ backgroundColor: '#333333', color: '#FFFFFF' }} />
                  <Legend wrapperStyle={{ color: '#FFFFFF' }} />
                  <Line
                    type="monotone"
                    dataKey="velocity"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={false}
                    name="Velocity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sağ Taraf: Rotasyon Pencereleri */}
        <div style={{ width: '20%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: '#333333', padding: '20px', borderRadius: '10px' }}>
            <h3 style={{ color: '#0000FF', marginBottom: '10px' }}>Craft Orientation</h3>
            <div style={{ height: '30vh', backgroundColor: '#555555', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
              Orientation Placeholder
            </div>
          </div>
          <div style={{ backgroundColor: '#333333', padding: '20px', borderRadius: '10px' }}>
            <h3 style={{ color: '#0000FF', marginBottom: '10px' }}>Rotation</h3>
            <div style={{ height: '30vh', backgroundColor: '#555555', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
              Rotation Placeholder
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;