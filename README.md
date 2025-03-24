# 🚀 Blue Origin BODDL-TP Flight 1 Visualization

This project is an interactive simulation interface developed using flight data from the **Blue Origin Deorbit, Descent, and Landing Tipping Point (BODDL-TP) Game Changing Development (GCD) Program**. It visualizes and analyzes the flight data, providing insights into key flight events and metrics.

## ✨ Project Features
- Frontend developed with **React** for a modern and responsive UI
- User-friendly UI supported by the **Material UI** library
- 3D flight simulation created with **p5.js**
- Graphs showing Speed–Time and Altitude–Time
- Vertical **Flight Events Bar** to visualize key flight events during the mission
- Python scripts to preprocess and synchronize the flight data for easy consumption by the app

## 📁 Used Data
The data used in this project was recorded during Flight 1 and includes:
- IMU data (delta velocity, delta angle)
- Truth data (position, velocity, and orientation)
- Commercial LiDAR data (range and Doppler velocity along beam lines)
- Time-stamped key flight events (liftoff, MECO, apogee, etc.)

## 🛠️ Technologies Used
| Technology            | Purpose                                |
|-----------------------|----------------------------------------|
| **React**             | Frontend development                   |
| **Material UI**       | UI components and design support       |
| **p5.js**             | 3D simulation and animation            |
| **Python**            | Data preprocessing and synchronization |
| **Chart.js** _(optional)_ | Time-series graphs                    |

## 📸 Screenshots


## 📌 Development Plans

The following features and improvements are planned for future development:

- **Commercial LiDAR and Orientation Data**: Use LiDAR and orientation data to create more detailed and accurate flight environments. LiDAR data can be used for real-time terrain analysis, while orientation data can help improve the precision of the flight simulation.

- **Manual Event Insertion and Playback Controls**: Allow users to manually insert events or control the playback of specific time segments during the flight. This would provide more interactivity and make the simulation more educational.

- **Landing Area Map Visualization**: Visualize the landing area and other critical points on a map. This would allow users to better understand the relationship between the flight trajectory and landing zone.

- **Real-Time Flight Tracking**: Enable the synchronization of data in real-time, allowing the app to display live flight parameters. This feature would be particularly useful for training and flight simulation purposes.

- **Interactive 3D Map and Visualizations**: Develop interactive 3D maps and visualizations that enable users to explore various flight dynamics such as speed, altitude, and orientation in a more immersive way.

---

These planned features aim to enhance the simulation and provide users with an even more interactive and detailed understanding of the flight dynamics and events.
