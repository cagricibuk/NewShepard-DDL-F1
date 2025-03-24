import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import P5Sketch from './P5Sketch';
// Material-UI ikonlarını import edin (üst kısma ekleyin)
import ScienceIcon from '@mui/icons-material/Science';
import {
  AppBar,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Container,
  CssBaseline,
  Grid,
  LinearProgress,
  Paper,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
  useTheme
} from '@mui/material';
import { blue, grey } from '@mui/material/colors';

// Blue Origin color palette
const blueOriginColors = {
  darkBlue: '#0B3D91',
  mediumBlue: '#1A66CC',
  lightBlue: '#3C8DFF',
  black: '#000000',
  white: '#FFFFFF',
  darkGray: '#1A1A1A'
};

const events = [
  { name: 'Ignition', time: 0, altitude: 1118 },
  { name: 'Liftoff', time: 7.26, altitude: 1118 },
  { name: 'Max Q', time: 60, altitude: 15000 },
  { name: 'MECO', time: 143.49, altitude: 56281 },
  { name: 'Apogee', time: 246.6, altitude: 106744 },
  { name: 'Deploy Brakes', time: 406.34, altitude: 6184 },
  { name: 'Restart Ignition', time: 425.31, altitude: 2201 },
  { name: 'Touchdown', time: 447.83, altitude: 1116 },
];

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: blueOriginColors.mediumBlue,
      contrastText: blueOriginColors.white
    },
    secondary: {
      main: blueOriginColors.lightBlue
    },
    background: {
      default: blueOriginColors.black,
      paper: blueOriginColors.darkGray
    },
    text: {
      primary: blueOriginColors.white,
      secondary: blueOriginColors.lightBlue
    }
  },
  typography: {
    fontFamily: '"Orbitron", "Roboto", sans-serif',
    h5: {
      fontWeight: 700,
      letterSpacing: 1
    },
    h6: {
      fontWeight: 600,
      letterSpacing: 0.5
    },
    body1: {
      letterSpacing: 0.25
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          border: `1px solid ${blueOriginColors.darkBlue}`,
          background: `linear-gradient(135deg, ${blueOriginColors.darkGray} 0%, #0F0F0F 100%)`
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${blueOriginColors.darkGray} 0%, #0F0F0F 100%)`,
          border: `1px solid ${blueOriginColors.darkBlue}`
        }
      }
    }
  }
});

function App() {
  const [flightData, setFlightData] = useState([]);
  const [simulationData, setSimulationData] = useState([]);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [countdown, setCountdown] = useState('T - 50');
  const [progress, setProgress] = useState(0);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [rocketImages, setRocketImages] = useState(null);

  const currentIndexRef = useRef(0);
  const startTimeRef = useRef(null);
  const requestRef = useRef();
  const eventTimeoutRef = useRef();
  const elapsedTimeRef = useRef(0);
  const CurrentTimeRef = useRef();

  const theme = useTheme();

  useEffect(() => {
    const loadImages = async () => {
      const loadImg = (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve(img);
        });

      const images = {
        default: await loadImg('/images/NSDefault.png'),
        fire: await loadImg('/images/NSFire.png'),
        booster: await loadImg('/images/NSBooster.png'),
        deployed: await loadImg('/images/NSDeployed.png'),
      };

      setRocketImages(images);
    };

    loadImages();
  }, []);

  useEffect(() => {
    fetch('/flight_data.json')
      .then((response) => response.json())
      .then((data) => {
        setFlightData(data);
      })
      .catch((error) => console.error('Error loading JSON:', error));
  }, []);

  const updateSimulation = (timestamp) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsedTime = elapsedTimeRef.current + (timestamp - startTimeRef.current) * simulationSpeed;
    const currentTime = -50 + elapsedTime / 1000;
    const currentSecond = Math.floor(currentTime);
    CurrentTimeRef.current = currentSecond;

    if (currentSecond > 0) {
      setCountdown(`T + ${Math.abs(currentSecond)}`);
    } else {
      setCountdown(`T - ${Math.abs(currentSecond)}`);
    }

    const progressPercentage = ((currentTime + 50) / 500) * 100;
    setProgress(progressPercentage);

    while (
      currentIndexRef.current < flightData.length &&
      flightData[currentIndexRef.current].flight_time_seconds <= currentTime
    ) {
      setSimulationData((prevData) => [...prevData, flightData[currentIndexRef.current]]);
      currentIndexRef.current += 1;
    }

    const activeEvent = events.find((event) => Math.abs(event.time - currentTime) < 1);
    if (activeEvent && currentEvent?.name !== activeEvent.name) {
      setCurrentEvent(activeEvent);
      if (eventTimeoutRef.current) {
        clearTimeout(eventTimeoutRef.current);
      }
      eventTimeoutRef.current = setTimeout(() => {
        setCurrentEvent(null);
      }, 5000);
    }

    if (currentTime <= 450) {
      requestRef.current = requestAnimationFrame(updateSimulation);
    } else {
      setIsSimulationRunning(false);
    }
  };

  useEffect(() => {
    if (isSimulationRunning) {
      startTimeRef.current = null;
      requestRef.current = requestAnimationFrame(updateSimulation);
    } else {
      cancelAnimationFrame(requestRef.current);
    }

    return () => cancelAnimationFrame(requestRef.current);
  }, [isSimulationRunning, simulationSpeed]);

  const currentVelocity = simulationData.length > 0 ? simulationData[simulationData.length - 1].velocity : 0;
  const currentAltitude = simulationData.length > 0 ? simulationData[simulationData.length - 1].altitude : 0;

  const handleSpeedChange = (speed) => {
    setSimulationSpeed(speed);
    elapsedTimeRef.current += (performance.now() - startTimeRef.current) * simulationSpeed;
    startTimeRef.current = performance.now();
  };

  const startSimulation = () => {
    setIsSimulationRunning(true);
    setSimulationData([]);
    currentIndexRef.current = 0;
    startTimeRef.current = null;
    elapsedTimeRef.current = 0;
    setCountdown('T - 50');
    setProgress(0);
    setCurrentEvent(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '110vh',
        background: `linear-gradient(135deg, ${blueOriginColors.black} 0%, #121212 100%)`
      }}>
        {/* Main Content */}
        <Container maxWidth="l" sx={{ py: 1, flexGrow: 1 }}>
          {/* App Bar */}
          <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        background: `linear-gradient(90deg, ${blueOriginColors.black} 0%, ${blueOriginColors.darkBlue} 100%)`,
        borderBottom: `1px solid ${blueOriginColors.mediumBlue}`,
        py: 1
      }}
    >
      <Toolbar sx={{
        minHeight: '64px !important',
        flexDirection: 'column',
        alignItems: 'stretch'
      }}>
        {/* YENİ: Üst bilgi çubuğu - Uçuş bilgileri */}
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'center',
          mb: 1,
          position: 'relative',
          height: '24px' // Sabit yükseklik
        }}>
          {/* Sol taraf - Uçuş bilgisi */}
          <Box sx={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            display: { xs: 'none', sm: 'flex' } // Mobilde gizle
          }}>
            <Typography variant="caption" sx={{
              color: 'rgba(255,255,255,0.7)',
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.65rem'
            }}>
              <ScienceIcon fontSize="inherit" sx={{ mr: 0.5 }} />
              NS-13 Flight | BODDL-TP Program
            </Typography>
          </Box>

          {/* Orta - Ana başlık (mevcut) */}
          <Typography variant="h6" component="div" sx={{ 
            textAlign: 'center',
            flexGrow: 1 
          }}>
            <Box component="span" sx={{ color: blueOriginColors.lightBlue }}>BLUE</Box> ORIGIN LAUNCH SIMULATOR
          </Typography>

          {/* Sağ taraf - Analist bilgisi */}
          <Typography variant="caption" sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.65rem',
            display: { xs: 'none', md: 'block' } // Küçük ekranlarda gizle
          }}>
            Çağrı ÇIBUK
          </Typography>
        </Box>

        {/* MEVCUT: Hız kontrolleri ve Launch butonu */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end', // Sağa yasla
          width: '100%',
          mb: 2
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <ButtonGroup variant="contained" size="medium">
              <Button 
                onClick={() => handleSpeedChange(1)} 
                sx={{
                  bgcolor: simulationSpeed === 1 ? blueOriginColors.mediumBlue : blueOriginColors.darkBlue,
                  '&:hover': { bgcolor: blueOriginColors.mediumBlue }
                }}
              >
                1x
              </Button>
              <Button 
                onClick={() => handleSpeedChange(2)} 
                sx={{
                  bgcolor: simulationSpeed === 2 ? blueOriginColors.mediumBlue : blueOriginColors.darkBlue,
                  '&:hover': { bgcolor: blueOriginColors.mediumBlue }
                }}
              >
                2x
              </Button>
              <Button 
                onClick={() => handleSpeedChange(4)} 
                sx={{
                  bgcolor: simulationSpeed === 4 ? blueOriginColors.mediumBlue : blueOriginColors.darkBlue,
                  '&:hover': { bgcolor: blueOriginColors.mediumBlue }
                }}
              >
                4x
              </Button>
            </ButtonGroup>
            <Button
              onClick={startSimulation}
              disabled={isSimulationRunning}
              variant="contained"
              size="medium"
              sx={{
                bgcolor: blueOriginColors.lightBlue,
                '&:hover': { bgcolor: blueOriginColors.mediumBlue },
                minWidth: '120px'
              }}
            >
              {isSimulationRunning ? 'Running...' : 'Launch'}
            </Button>
          </Box>
        </Box>

        {/* MEVCUT: Metrik kartları */}
        <Box sx={{
          display: 'flex',
          gap: 1,
          width: '100%',
          flexWrap: 'wrap'
        }}>
          <Card sx={{
            flex: '1 1 200px',
            minWidth: '120px',
            height: '8vh',
            background: 'rgba(0,0,0,0.3)'
          }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="overline" color="white">
                Velocity
              </Typography>
              <Typography variant="h5" color="primary">
                {currentVelocity.toFixed(2)} m/s
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{
            flex: '1 1 200px',
            minWidth: '120px',
            height: '8vh',
            background: 'rgba(0,0,0,0.3)'
          }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="overline" color="white">
                Altitude
              </Typography>
              <Typography variant="h5" color="primary">
                {currentAltitude.toFixed(2)} m
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{
            flex: '1 1 200px',
            minWidth: '120px',
            height: '8vh',
            background: 'rgba(0,0,0,0.3)'
          }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="overline" color="white">
                Timer
              </Typography>
              <Typography variant="h5" color="primary">
                {countdown}
              </Typography>
            </CardContent>
          </Card>

          {currentEvent && (
            <Card sx={{
              flex: '1 1 300px',
              minWidth: '200px',
              height: '8vh',
              borderLeft: `4px solid ${blueOriginColors.lightBlue}`,
              background: `linear-gradient(90deg, rgba(11,61,145,0.2) 0%, rgba(11,61,145,0.1) 100%)`
            }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="overline" color="white">
                  Current Event
                </Typography>
                <Typography variant="h5" color="#FFFF00">
                  {currentEvent.name}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Toolbar>
    </AppBar>




          {/* Main Layout */}
          <Grid container spacing={2} sx={{ height: '60vh', marginTop: '1vh' }}>
            {/* Timeline */}
            <Grid item xs={1}>
              <Paper elevation={7} sx={{
                height: '75vh',
                backgroundColor: blueOriginColors.darkGray,

                p: 1,
                position: 'relative',
                overflow: 'visible'
              }}>
                <Box sx={{
                  height: '100%',
                  width: '16px',
                  mx: 'auto',
                  marginLeft: '1vh',
                  position: 'relative',
                  background: `linear-gradient(180deg, ${blueOriginColors.darkBlue} 0%, rgba(0,0,0,0) 100%)`,
                  borderRadius: '8px'
                }}>
                  {/* Progress track */}
                  <Box sx={{
                    height: '100%',
                    width: '100%',
                    position: 'absolute',

                    background: 'rgba(11,61,145,0.2)',
                    borderRadius: '8px'
                  }} />

                  {/* Progress indicator */}
                  <Box
                    sx={{
                      height: `${progress}%`,
                      width: '100%',

                      background: `linear-gradient(180deg, ${blueOriginColors.lightBlue} 0%, ${blueOriginColors.mediumBlue} 100%)`,
                      borderRadius: '8px',
                      position: 'absolute',
                      bottom: 0,
                      boxShadow: `0 0 8px ${blueOriginColors.lightBlue}`,
                      transition: 'height 0.1s linear'
                    }}
                  />

                  {/* Event markers */}
                  {events.map((event, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'absolute',
                        bottom: `${((event.time + 47) / 500) * 100}%`,

                        marginLeft: '-1.2vh',
                        transform: 'translateX(-50%)',
                        width: '100%',
                        zIndex: 2
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          left: '20px',
                          top: '50%',
                          height: '2px',
                          width: '24px',
                          background: `linear-gradient(90deg, ${blueOriginColors.lightBlue} 0%, rgba(11,61,145,0) 100%)`,
                          transform: 'translateY(-50%)'
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          left: '44px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          whiteSpace: 'nowrap',
                          color: blueOriginColors.lightBlue,
                          fontSize: '0.7rem',
                          fontWeight: 600,

                          textShadow: `0 0 4px ${blueOriginColors.lightBlue}`
                        }}
                      >
                        {event.name} ({event.time}s)
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* 3D Visualization */}
            <Grid item xs={3}>
              <Paper elevation={3} sx={{
                height: '100%',

                backgroundColor: blueOriginColors.darkGray,
                p: 0,
                marginLeft: '3vw',
                overflow: 'hidden',
                position: 'relative',
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(135deg, rgba(11,61,145,0.1) 0%, rgba(0,0,0,0) 100%)`,
                  pointerEvents: 'none'
                }
              }}>
                <P5Sketch
                  altitude={currentAltitude}
                  velocity={currentVelocity}
                  isSimulationRunning={isSimulationRunning}
                  elapsedTime={CurrentTimeRef.current}
                  rocketImages={rocketImages}
                />
              </Paper>
            </Grid>

            {/* Visualization Windows - Stacked Vertically */}
            <Grid item xs={2} >
              <Grid container direction="column" height='100%' spacing={2} >
                {/* Top Visualization Window */}
                <Grid item xs={6}>
                  <Paper elevation={3} sx={{
                    height: '99%',
                    p: 2,
                    backgroundColor: blueOriginColors.darkGray,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: blueOriginColors.lightBlue,
                   
                  }}>
                    <Typography variant="h6" color="White" sx={{ mb: 2 }}>
                      LIDAR
                    </Typography>
                    <Box sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      {/* Placeholder for LIDAR visualization */}
                      <Typography variant="body2" color="textSecondary">
                        LIDAR visualization will appear here
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                {/* Bottom Visualization Window */}
                <Grid item xs={6}>
                  <Paper elevation={3} sx={{
                    height: '99%',
                    p: 2,
                    backgroundColor: blueOriginColors.darkGray,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: blueOriginColors.lightBlue,
                    
                  }}>
                    <Typography variant="h6" color="White" sx={{ mb: 2 }}>
                      ORIENTATION
                    </Typography>
                    <Box sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      {/* Placeholder for orientation visualization */}
                      <Typography variant="body2" color="textSecondary">
                        Orientation visualization will appear here
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
            {/* ikinci sutun*/}
            {/* Visualization Windows - Stacked Vertically */}
            <Grid item xs={2} >
              <Grid container direction="column" height='100%' spacing={2} >
                {/* Top Visualization Window */}
                <Grid item xs={4} width={950}>
                  <Paper elevation={3} sx={{
                    height: '38.5vh',
                    p: 1.5,
                    backgroundColor: blueOriginColors.darkGray,

                  }}>
                    <Typography variant="h6" gutterBottom color={blueOriginColors.white} sx={{ mb: 1 }}>
                      ALTITUDE vs TIME
                    </Typography>
                    <Box height={250} sx={{ height: 'calc(100% - 36px)' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={simulationData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={blueOriginColors.darkBlue} />
                          <XAxis
                            dataKey="flight_time_seconds"
                            type="number"
                            domain={[-50, 450]}
                            ticks={[-50, 0, 50, 100, 150, 200, 250, 300, 350, 400, 450]}
                            tick={{
                              fill: blueOriginColors.lightBlue,
                              fontSize: '0.7rem'
                            }}
                            label={{
                              value: 'FLIGHT TIME (SECONDS)',
                              position: 'insideBottom',
                              offset: -5,
                              fill: blueOriginColors.lightBlue,
                              fontSize: '0.7rem'
                            }}
                          />
                          <YAxis
                            domain={[0, 110000]}
                            tick={{
                              fill: blueOriginColors.lightBlue,
                              fontSize: '0.7rem'
                            }}
                            label={{
                              value: 'ALTITUDE (METERS)',
                              angle: -90,
                              position: 'insideLeft',
                              offset: 10,
                              fill: blueOriginColors.lightBlue,
                              fontSize: '0.7rem'
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              background: blueOriginColors.darkGray,
                              borderColor: blueOriginColors.mediumBlue,
                              borderRadius: '4px',
                              color: blueOriginColors.lightBlue
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="altitude"
                            stroke={blueOriginColors.lightBlue}
                            strokeWidth={3}
                            dot={false}
                            name="Altitude"
                            isAnimationActive={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>

                {/* Bottom Visualization Window */}
                <Grid item xs={6}>
                  <Paper elevation={3} sx={{
                    height: '100%',
                    p: 1.5,
                    backgroundColor: blueOriginColors.darkGray,

                  }}>
                    <Typography variant="h6" gutterBottom color={blueOriginColors.white} sx={{ mb: 1 }}>
                      VELOCITY vs TIME
                    </Typography>
                    <Box sx={{ height: 'calc(100% - 36px)' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={simulationData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={blueOriginColors.darkBlue} />
                          <XAxis
                            dataKey="flight_time_seconds"
                            type="number"
                            domain={[-50, 450]}
                            ticks={[-50, 0, 50, 100, 150, 200, 250, 300, 350, 400, 450]}
                            tick={{
                              fill: blueOriginColors.lightBlue,
                              fontSize: '0.7rem'
                            }}
                            label={{
                              value: 'FLIGHT TIME (SECONDS)',
                              position: 'insideBottom',
                              offset: -5,
                              fill: blueOriginColors.lightBlue,
                              fontSize: '0.7rem'
                            }}
                          />
                          <YAxis
                            domain={[0, 1000]}
                            ticks={[0, 500, 1000]}
                            tick={{
                              fill: blueOriginColors.lightBlue,
                              fontSize: '0.7rem'
                            }}
                            label={{
                              value: 'VELOCITY (M/S)',
                              angle: -90,
                              position: 'insideLeft',
                              offset: 10,
                              fill: blueOriginColors.lightBlue,
                              fontSize: '0.7rem'
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              background: blueOriginColors.darkGray,
                              borderColor: blueOriginColors.mediumBlue,
                              borderRadius: '4px',
                              color: blueOriginColors.lightBlue
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="velocity"
                            stroke={blueOriginColors.lightBlue}
                            strokeWidth={3}
                            dot={false}
                            name="Velocity"
                            isAnimationActive={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>

          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;