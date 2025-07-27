import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { geminiAI } from '../services/geminiAI';

interface VoiceInputProps {
  onVoiceInput: (transcript: string, audioBlob: Blob) => void;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  disabled?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onVoiceInput,
  isListening,
  onStartListening,
  onStopListening,
  disabled = false
}) => {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isUsingGeminiSTT, setIsUsingGeminiSTT] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const stopListeningRef = useRef<(() => void) | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const transcriptRef = useRef<string>(''); // Add ref to track latest transcript

  useEffect(() => {
    setIsUsingGeminiSTT(true); 

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(error => {
          console.warn('AudioContext already closed:', error);
        });
      }
    };
  }, [isListening]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio recording
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const finalTranscript = transcriptRef.current.trim();
        console.log(`🎤 Recording stopped. Transcript ref contains: "${transcriptRef.current}"`);
        console.log(`🎤 Final transcript after trim: "${finalTranscript}"`);
        if (finalTranscript) {
          console.log(`✅ Sending voice input: "${finalTranscript}"`);
          onVoiceInput(finalTranscript, audioBlob);
        } else {
          console.log(`⚠️ No transcript to send - transcript ref was empty`);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      // Set up audio visualization
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTranscript('');
      transcriptRef.current = ''; // Reset ref as well
      
      // Start speech recognition using Gemini AI service
      if (isUsingGeminiSTT) {
        // Use Gemini STT when available
        stopListeningRef.current = geminiAI.startListening(
          (transcript, isFinal) => {
            console.log(`🎤 STT Result: "${transcript}" (final: ${isFinal})`);
            if (isFinal) {
              console.log(`📝 Final transcript captured: "${transcript}"`);
              transcriptRef.current = transcript;
              setTranscript(transcript);
            } else {
              console.log(`💬 Interim transcript: "${transcript}"`);
              // Show interim results but don't commit to ref yet
              setTranscript(transcript);
            }
          },
          (error) => {
            console.error('Gemini STT error:', error);
            // Fallback to Web Speech API
            startWebSpeechRecognition();
          }
        );
      } else {
        // Use Web Speech API as fallback
        startWebSpeechRecognition();
      }
      
      onStartListening();
      updateAudioLevel();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const startWebSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Update both ref and state for consistency
        if (finalTranscript) {
          transcriptRef.current = finalTranscript;
          setTranscript(finalTranscript);
        } else if (interimTranscript) {
          // Show interim results but don't commit to ref yet
          setTranscript(interimTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      recognition.start();
      
      stopListeningRef.current = () => {
        recognition.stop();
      };
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      
      if (stopListeningRef.current) {
        stopListeningRef.current();
        stopListeningRef.current = null;
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      onStopListening();
    }
  };

  const updateAudioLevel = () => {
    if (analyserRef.current && isRecording) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255);
      
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  };

  const handleToggleRecording = () => {
    if (disabled) return;
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="relative">
        {/* Simple audio level ring when recording */}
        {isRecording && (
          <div 
            className="absolute inset-0 rounded-full border-2 border-red-400/60 animate-pulse"
            style={{ 
              transform: `scale(${1.1 + audioLevel * 0.3})`,
            }}
          />
        )}

        {/* Main microphone button */}
        <button
          onClick={handleToggleRecording}
          disabled={disabled}
          className={`relative w-16 h-16 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
            isRecording
              ? 'bg-red-500 shadow-lg shadow-red-500/30'
              : 'bg-blue-600 shadow-lg shadow-blue-500/30 hover:bg-blue-700'
          }`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {isRecording ? (
              <MicOff size={24} className="text-white" />
            ) : (
              <Mic size={24} className="text-white" />
            )}
          </div>
        </button>

        {/* Simple status text */}
        <div className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap ${
          isRecording ? 'text-red-600' : 'text-gray-600'
        }`}>
          {disabled ? 'Processing...' : isRecording ? 'Listening...' : 'Tap to speak'}
        </div>
      </div>
    </div>
  );
};

export default VoiceInput;