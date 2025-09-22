import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  CircularProgress,
  Alert,
  Fab,
  Tooltip
} from '@mui/material';
import {
  CameraAlt,
  PhotoCamera,
  Videocam,
  Close,
  Info,
  LocationOn,
  AccessTime,
  Star,
  Share,
  Download,
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from 'react-query';
import toast from 'react-hot-toast';

// Services
import { generateARContent, generateARExperiences } from '../../services/arService';

const ARExploration = ({ itinerary, destination }) => {
  const [arContent, setArContent] = useState(null);
  const [arExperiences, setArExperiences] = useState(null);
  const [selectedLandmark, setSelectedLandmark] = useState(null);
  const [isARActive, setIsARActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showARModal, setShowARModal] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // AR content mutation
  const arContentMutation = useMutation(generateARContent, {
    onSuccess: (data) => {
      setArContent(data.arContent);
    },
    onError: (error) => {
      toast.error('Failed to generate AR content');
    }
  });

  // AR experiences mutation
  const arExperiencesMutation = useMutation(generateARExperiences, {
    onSuccess: (data) => {
      setArExperiences(data.arExperiences);
    },
    onError: (error) => {
      toast.error('Failed to generate AR experiences');
    }
  });

  useEffect(() => {
    if (itinerary && destination) {
      generateARData();
    }
  }, [itinerary, destination]);

  const generateARData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        arExperiencesMutation.mutate({ itinerary, userInterests: itinerary.params?.interests || [] })
      ]);
    } catch (error) {
      console.error('Error generating AR data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLandmarkClick = async (landmark) => {
    setSelectedLandmark(landmark);
    setLoading(true);
    
    try {
      await arContentMutation.mutate({ landmark: landmark.name, destination });
    } catch (error) {
      console.error('Error generating AR content for landmark:', error);
    } finally {
      setLoading(false);
    }
  };

  const startARExperience = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: true
      });
      
      setCameraStream(stream);
      setIsARActive(true);
      setShowARModal(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Camera access denied. Please allow camera permission.');
    }
  };

  const stopARExperience = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsARActive(false);
    setShowARModal(false);
    setIsRecording(false);
  };

  const startRecording = () => {
    if (cameraStream && videoRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // Set up canvas for recording
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      
      const recordFrame = () => {
        if (isRecording) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          // Add AR overlays here
          addAROverlays(ctx);
          requestAnimationFrame(recordFrame);
        }
      };
      
      setIsRecording(true);
      recordFrame();
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Process recorded frames here
    toast.success('AR experience recorded!');
  };

  const addAROverlays = (ctx) => {
    if (selectedLandmark && arContent) {
      // Add historical information overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 300, 100);
      
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.fillText(selectedLandmark.name, 20, 30);
      ctx.fillText(arContent.historicalInfo.substring(0, 50) + '...', 20, 50);
      
      // Add AR markers
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.strokeRect(50, 50, 100, 100);
    }
  };

  const shareARExperience = () => {
    if (navigator.share) {
      navigator.share({
        title: `AR Experience at ${selectedLandmark?.name}`,
        text: `Check out this AR exploration of ${selectedLandmark?.name} in ${destination}`,
        url: window.location.href
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const getLandmarkIcon = (landmark) => {
    const iconMap = {
      'Gateway of India': '🏛️',
      'Red Fort': '🏰',
      'Taj Mahal': '🕌',
      'Charminar': '🕌',
      'Hawa Mahal': '🏰',
      'Vidhana Soudha': '🏛️',
      'Kapaleeshwarar Temple': '🛕'
    };
    return iconMap[landmark.name] || '🏛️';
  };

  if (loading && !arExperiences) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        🥽 AR Exploration
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Discover {destination} through immersive Augmented Reality experiences. 
        Point your camera at landmarks to see historical information, cultural context, and interactive elements.
      </Typography>

      <Grid container spacing={3}>
        {/* AR Landmarks */}
        {arExperiences?.landmarks && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  AR-Enabled Landmarks
                </Typography>
                <Grid container spacing={2}>
                  {arExperiences.landmarks.map((landmark, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Card
                          sx={{
                            cursor: 'pointer',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            '&:hover': {
                              boxShadow: 6
                            }
                          }}
                          onClick={() => handleLandmarkClick(landmark)}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <span style={{ fontSize: '2rem' }}>
                                {getLandmarkIcon(landmark)}
                              </span>
                              <Typography variant="h6">
                                {landmark.name}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              {landmark.description}
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {landmark.arFeatures?.slice(0, 2).map((feature, idx) => (
                                <Chip
                                  key={idx}
                                  label={feature}
                                  size="small"
                                  sx={{
                                    background: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    fontSize: '0.7rem'
                                  }}
                                />
                              ))}
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* AR Features */}
        {arContent && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  AR Features for {selectedLandmark?.name}
                </Typography>
                
                <List dense>
                  {arContent.interactiveElements?.map((element, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Info color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={element} />
                    </ListItem>
                  ))}
                </List>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Photo Opportunities
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {arContent.photoSpots?.map((spot, index) => (
                      <Chip
                        key={index}
                        label={spot}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Best Times for AR
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {arContent.bestTimes}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* AR Controls */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AR Controls
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CameraAlt />}
                  onClick={startARExperience}
                  disabled={!selectedLandmark}
                  sx={{
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                    }
                  }}
                >
                  Start AR Experience
                </Button>

                {selectedLandmark && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Share />}
                      onClick={shareARExperience}
                      size="small"
                    >
                      Share
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      size="small"
                    >
                      Download
                    </Button>
                  </Box>
                )}
              </Box>

              {selectedLandmark && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Point your camera at {selectedLandmark.name} to see AR overlays and historical information.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AR Camera Modal */}
      <Dialog
        open={showARModal}
        onClose={stopARExperience}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'black',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            AR Experience - {selectedLandmark?.name}
          </Typography>
          <IconButton onClick={stopARExperience} color="inherit">
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <Box sx={{ position: 'relative', width: '100%', height: '400px' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none'
              }}
            />
            
            {/* AR Overlay Controls */}
            <Box sx={{ position: 'absolute', top: 16, left: 16, right: 16 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ background: 'rgba(0,0,0,0.7)', p: 1, borderRadius: 1 }}>
                  {selectedLandmark?.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
                    <IconButton
                      onClick={() => setIsMuted(!isMuted)}
                      sx={{ background: 'rgba(0,0,0,0.7)', color: 'white' }}
                    >
                      {isMuted ? <VolumeOff /> : <VolumeUp />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, background: 'rgba(0,0,0,0.8)' }}>
          <Button
            variant="contained"
            color={isRecording ? 'error' : 'primary'}
            startIcon={isRecording ? <Pause /> : <PlayArrow />}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating AR Button */}
      <Fab
        color="primary"
        aria-label="start ar"
        onClick={startARExperience}
        disabled={!selectedLandmark}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #FF5252 30%, #26A69A 90%)',
          }
        }}
      >
        <CameraAlt />
      </Fab>
    </Box>
  );
};

export default ARExploration;
