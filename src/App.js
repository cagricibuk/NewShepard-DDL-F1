import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

function App() {
  const [flightData, setFlightData] = useState([]);

  useEffect(() => {
    // Load JSON data
    fetch('/flight_data.json')
      .then((response) => response.json())
      .then((data) => {
        setFlightData(data);
      })
      .catch((error) => console.error('Error loading JSON:', error));
  }, []);

  // Extract data for plotting
  const flightTime = flightData.map((d) => d.flight_time_seconds);
  const altitude = flightData.map((d) => parseFloat(d.altitude));
  const velocity = flightData.map((d) => parseFloat(d.velocity));

  return (
    <div className="App">
      <h1>Blue Origin Flight Data Visualization</h1>

      {/* Time vs. Altitude Chart */}
      <Plot
        data={[
          {
            x: flightTime,
            y: altitude,
            type: 'scatter',
            mode: 'lines',
            line: { color: 'blue' },
            name: 'Altitude',
            hoverinfo: 'x+y',
            hovertemplate: 'Flight Time: %{x}s<br>Altitude: %{y}m',
          },
        ]}
        layout={{
          title: 'Flight Time vs. Altitude (AGL)',
          xaxis: {
            title: 'Flight Time (seconds)',
            range: [-50, 450],
            tickvals: [-50, 0, 50, 100, 150, 200, 250, 300, 350, 400, 450],
            ticktext: ['-50', '0', '50', '100', '150', '200', '250', '300', '350', '400', '450'],
          },
          yaxis: {
            title: 'Altitude AGL (meters)',
            range: [0, Math.max(...altitude)],
          },
          grid: { visible: true },
          showlegend: true,
        }}
        style={{ width: '100%', height: '400px', marginBottom: '40px' }}
      />

      {/* Velocity vs. Time Chart */}
      <Plot
        data={[
          {
            x: flightTime,
            y: velocity,
            type: 'scatter',
            mode: 'lines',
            line: { color: 'red' },
            name: 'Velocity',
            hoverinfo: 'x+y',
            hovertemplate: 'Flight Time: %{x}s<br>Velocity: %{y}m/s',
          },
        ]}
        layout={{
          title: 'Velocity vs. Flight Time',
          xaxis: {
            title: 'Flight Time (seconds)',
            range: [-50, 450],
            tickvals: [-50, 0, 50, 100, 150, 200, 250, 300, 350, 400, 450],
            ticktext: ['-50', '0', '50', '100', '150', '200', '250', '300', '350', '400', '450'],
          },
          yaxis: {
            title: 'Velocity (m/s)',
            range: [0, Math.max(...velocity)],
            tickvals: [0, 500, 1000],
            ticktext: ['0', '500', '1000'],
          },
          grid: { visible: true },
          showlegend: true,
        }}
        style={{ width: '100%', height: '400px', marginBottom: '40px' }}
      />
    </div>
  );
}

export default App;