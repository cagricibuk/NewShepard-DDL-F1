import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import P5Sketch from './P5Sketch';

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
  const [currentEvent, setCurrentEvent] = useState(null); // Şu anki event
  const [simulationSpeed, setSimulationSpeed] = useState(1); // Simülasyon hızı (1x, 2x, 4x)
  const currentIndexRef = useRef(0); // Mevcut veri indeksi (useRef kullanıyoruz)
  const startTimeRef = useRef(null); // Simülasyon başlangıç zamanı (useRef kullanıyoruz)
  const requestRef = useRef(); // requestAnimationFrame referansı
  const eventTimeoutRef = useRef(); // Event zaman aşımı referansı
  const elapsedTimeRef = useRef(0); // Geçen süreyi saklamak için (useRef kullanıyoruz)

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
    const elapsedTime = elapsedTimeRef.current + (timestamp - startTimeRef.current) * simulationSpeed;

    // Şu anki zamanı hesapla (saniye cinsinden)
    const currentTime = -50 + elapsedTime / 1000;

    // Şu anki zamanı tam saniyeye yuvarla
    const currentSecond = Math.floor(currentTime); // currentSecond tanımlandı

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

    // Önemli eventleri kontrol et
    const activeEvent = events.find((event) => Math.abs(event.time - currentTime) < 1); // 1 saniye tolerans
    if (activeEvent && currentEvent?.name !== activeEvent.name) {
      setCurrentEvent(activeEvent);
      // 5 saniye sonra event ismini kaldır
      if (eventTimeoutRef.current) {
        clearTimeout(eventTimeoutRef.current);
      }
      eventTimeoutRef.current = setTimeout(() => {
        setCurrentEvent(null);
      }, 5000); // 5 saniye
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
      startTimeRef.current = null; // Başlangıç zamanını sıfırla
      requestRef.current = requestAnimationFrame(updateSimulation);
    } else {
      // Simülasyon durdurulduğunda, requestAnimationFrame'i temizle
      cancelAnimationFrame(requestRef.current);
    }

    // Temizleme fonksiyonu
    return () => cancelAnimationFrame(requestRef.current);
  }, [isSimulationRunning, simulationSpeed]);

  // Velocity ve Altitude değerlerini hesapla
  const currentVelocity = simulationData.length > 0 ? simulationData[simulationData.length - 1].velocity : 0;
  const currentAltitude = simulationData.length > 0 ? simulationData[simulationData.length - 1].altitude : 0;

  return (
    <div style={{ backgroundColor: '#464747', color: '#FFFFFF', minHeight: '100vh', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Navbar Benzeri Üst Kısım */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '10px', backgroundColor: '#333333', borderRadius: '10px' }}>
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
          {currentEvent && (
            <div style={{ textAlign: 'center', marginLeft: '20px' }}>
              <h3 style={{ color: '#FF0000', marginBottom: '5px' }}>Event</h3>
              <div style={{ fontSize: '20px', color: '#FFFFFF' }}>{currentEvent.name}</div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Simülasyon Hızı Butonları */}
          <button
            onClick={() => {
              setSimulationSpeed(1);
              elapsedTimeRef.current += (performance.now() - startTimeRef.current) * simulationSpeed;
              startTimeRef.current = performance.now();
            }}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: simulationSpeed === 1 ? '#0000FF' : '#555555',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            1x
          </button>
          <button
            onClick={() => {
              setSimulationSpeed(2);
              elapsedTimeRef.current += (performance.now() - startTimeRef.current) * simulationSpeed;
              startTimeRef.current = performance.now();
            }}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: simulationSpeed === 2 ? '#0000FF' : '#555555',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            2x
          </button>
          <button
            onClick={() => {
              setSimulationSpeed(4);
              elapsedTimeRef.current += (performance.now() - startTimeRef.current) * simulationSpeed;
              startTimeRef.current = performance.now();
            }}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: simulationSpeed === 4 ? '#0000FF' : '#555555',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            4x
          </button>
          <button
            onClick={() => {
              setIsSimulationRunning(true); // Simülasyonu başlat
              setSimulationData([]); // Verileri sıfırla
              currentIndexRef.current = 0; // İndeksi sıfırla
              startTimeRef.current = null; // Başlangıç zamanını sıfırla
              elapsedTimeRef.current = 0; // Geçen süreyi sıfırla
              setCountdown('T - 50'); // Geri sayımı sıfırla
              setProgress(0); // Progress bar'ı sıfırla
              setCurrentEvent(null); // Event'i sıfırla
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
                  bottom: `${((event.time + 47) / 500) * 100}%`, // Olayın zamanına göre konumlandır
                  left: '100%',
                  marginLeft: '10px',
                  whiteSpace: 'nowrap',
                  fontSize: '12px',
                  color: '#FFFFFF',
                }}
              >
                {/* Dikey Çizgi */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-30px',
                    top: '50%',
                    height: '1%',
                    width: '20px',
                    backgroundColor: '#0000FF',
                    transform: 'translateY(-50%)',
                  }}
                />
                {event.name} ({event.time}s)
              </div>
            ))}
          </div>
        </div>

        {/* Orta: 3D Simülasyon (P5.js Animasyonu) */}
        <div style={{ flex: 2, backgroundColor: '#333333', padding: '20px', borderRadius: '10px', position: 'relative' }}>
          <P5Sketch altitude={currentAltitude} velocity={currentVelocity} isSimulationRunning={isSimulationRunning} />
        </div>

        {/* Sağ Taraf: Grafikler */}
        <div style={{ width: '30%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Altitude vs. Time Grafiği */}
          <div style={{ flex: 1, backgroundColor: '#333333', padding: '20px', borderRadius: '10px' }}>
            <h3 style={{ color: '#0000FF', marginBottom: '10px' }}>Altitude vs. Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={simulationData}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
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
                  domain={[0, 110000]}
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

          {/* Velocity vs. Time Grafiği */}
          <div style={{ flex: 1, backgroundColor: '#333333', padding: '20px', borderRadius: '10px' }}>
            <h3 style={{ color: '#0000FF', marginBottom: '10px' }}>Velocity vs. Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={simulationData}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
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
    </div>
  );
}

export default App;