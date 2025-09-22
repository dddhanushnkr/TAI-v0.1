import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Mic,
  MicOff,
  Close,
  VolumeUp,
  VolumeOff,
  RecordVoiceOver,
  Stop,
  PlayArrow,
  Pause
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from 'react-query';
import toast from 'react-hot-toast';

// Services
import { processVoiceCommand, getVoiceCommands } from '../../services/voiceService';

const VoiceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [availableCommands, setAvailableCommands] = useState([]);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);

  // Voice command mutation
  const processCommandMutation = useMutation(processVoiceCommand, {
    onSuccess: (data) => {
      setResponse(data.result);
      addToConversation('assistant', data.result.message);
      setIsProcessing(false);
      setIsListening(false);
      
      if (data.result.nextStep) {
        handleNextStep(data.result.nextStep, data.result);
      }
    },
    onError: (error) => {
      toast.error('Failed to process voice command');
      setIsProcessing(false);
      setIsListening(false);
    }
  });

  // Get available commands mutation
  const getCommandsMutation = useMutation(getVoiceCommands, {
    onSuccess: (data) => {
      setAvailableCommands(data.commands);
    }
  });

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setIsProcessing(false);
      };

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          addToConversation('user', finalTranscript);
          processVoiceCommand(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsProcessing(false);
        toast.error('Speech recognition failed. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Load available commands
    getCommandsMutation.mutate();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const addToConversation = (sender, message) => {
    setConversation(prev => [...prev, {
      id: Date.now(),
      sender,
      message,
      timestamp: new Date().toISOString()
    }]);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setResponse(null);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const processVoiceCommand = async (command) => {
    setIsProcessing(true);
    
    // Simulate audio data (in real app, this would be actual audio)
    const audioData = {
      transcript: command,
      timestamp: new Date().toISOString()
    };

    processCommandMutation.mutate({
      audioData,
      userId: 'demo-user'
    });
  };

  const handleNextStep = (nextStep, data) => {
    switch (nextStep) {
      case 'confirm_details':
        toast.success('Please confirm your trip details');
        break;
      case 'get_more_info':
        toast.info('I need more information to help you');
        break;
      case 'apply_modification':
        toast.success('Applying your modifications...');
        break;
      case 'connect_emergency':
        toast.error('Connecting to emergency services...');
        break;
      default:
        break;
    }
  };

  const speakResponse = (text) => {
    if ('speechSynthesis' in window && !isMuted) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const clearConversation = () => {
    setConversation([]);
    setTranscript('');
    setResponse(null);
  };

  const getCommandIcon = (commandName) => {
    const iconMap = {
      'plan_trip': '✈️',
      'modify_itinerary': '✏️',
      'weather_check': '🌤️',
      'find_places': '🔍',
      'book_activity': '📅',
      'navigation': '🧭',
      'translate': '🌐',
      'emergency': '🚨'
    };
    return iconMap[commandName] || '🎤';
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="voice assistant"
        onClick={() => setIsOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
          }
        }}
      >
        <RecordVoiceOver />
      </Fab>

      {/* Voice Assistant Dialog */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            minHeight: '70vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            🎤 AI Voice Assistant
          </Typography>
          <Box>
            <IconButton onClick={() => setIsMuted(!isMuted)} color="inherit">
              {isMuted ? <VolumeOff /> : <VolumeUp />}
            </IconButton>
            <IconButton onClick={() => setIsOpen(false)} color="inherit">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Voice Status */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <motion.div
              animate={{
                scale: isListening ? [1, 1.2, 1] : 1,
                opacity: isListening ? [0.7, 1, 0.7] : 1
              }}
              transition={{
                duration: 1,
                repeat: isListening ? Infinity : 0
              }}
            >
              <Fab
                size="large"
                color={isListening ? 'error' : 'primary'}
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                sx={{
                  width: 80,
                  height: 80,
                  background: isListening 
                    ? 'linear-gradient(45deg, #f44336 30%, #ff5722 90%)'
                    : 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)',
                  '&:hover': {
                    background: isListening 
                      ? 'linear-gradient(45deg, #d32f2f 30%, #f4511e 90%)'
                      : 'linear-gradient(45deg, #388e3c 30%, #689f38 90%)',
                  }
                }}
              >
                {isProcessing ? (
                  <CircularProgress color="inherit" size={30} />
                ) : isListening ? (
                  <Stop />
                ) : (
                  <Mic />
                )}
              </Fab>
            </motion.div>

            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Tap to speak'}
            </Typography>

            {transcript && (
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                You said: "{transcript}"
              </Typography>
            )}
          </Box>

          {/* Available Commands */}
          <Card sx={{ mb: 3, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Available Commands
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availableCommands.map((command) => (
                  <Chip
                    key={command.name}
                    icon={<span>{getCommandIcon(command.name)}</span>}
                    label={command.description}
                    variant="outlined"
                    sx={{ 
                      color: 'white', 
                      borderColor: 'rgba(255,255,255,0.3)',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.1)'
                      }
                    }}
                    onClick={() => processVoiceCommand(command.keywords[0])}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Conversation History */}
          <Card sx={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Conversation
                </Typography>
                <Button
                  size="small"
                  onClick={clearConversation}
                  sx={{ color: 'white' }}
                >
                  Clear
                </Button>
              </Box>

              <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                <AnimatePresence>
                  {conversation.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                          mb: 2
                        }}
                      >
                        <Card
                          sx={{
                            maxWidth: '80%',
                            background: message.sender === 'user' 
                              ? 'rgba(33, 150, 243, 0.8)' 
                              : 'rgba(255, 255, 255, 0.2)',
                            color: 'white'
                          }}
                        >
                          <CardContent sx={{ py: 1, px: 2 }}>
                            <Typography variant="body2">
                              {message.message}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {conversation.length === 0 && (
                  <Typography variant="body2" sx={{ textAlign: 'center', opacity: 0.7, py: 4 }}>
                    Start a conversation by speaking or clicking a command above
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setIsOpen(false)}
            variant="outlined"
            sx={{ 
              color: 'white', 
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: 'white',
                background: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Response Snackbar */}
      <Snackbar
        open={!!response && !isOpen}
        autoHideDuration={6000}
        onClose={() => setResponse(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setResponse(null)}
          severity="info"
          sx={{ width: '100%' }}
        >
          {response?.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default VoiceAssistant;
