import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Camera, CameraOff, Volume2, VolumeX, Brain, Activity, Wifi, WifiOff, Power, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { think } from '@/modules/brainAdapter';
import { dispatch } from '@/modules/actionDispatcher';
import { seedOrgansIfEmpty, markInvoked } from '@/modules/organService';
import { getSessionId, generateRequestId } from '@/modules/session';
import { Utterance, Frame, BrainCall, ActionLog, DeviceState } from '@/api/entities';

export default function ConsolePage() {
  const sessionId = getSessionId();
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const scrollRef = useRef(null);

  // Voice gate state
  const [awake, setAwake] = useState(false);
  const [muted, setMuted] = useState(false);
  const [listening, setListening] = useState(false);

  // Transcript
  const [utterances, setUtterances] = useState([]);
  const [speakText, setSpeakText] = useState('');

  // Camera
  const [cameraActive, setCameraActive] = useState(false);

  // Device state
  const [deviceState, setDeviceState] = useState({
    battery: null,
    charging: false,
    online: navigator.onLine,
    orientation: null,
    permissions: {}
  });

  // Brain status
  const [lastBrainResult, setLastBrainResult] = useState(null);

  // --- ORGAN SEEDING ---
  useEffect(() => {
    seedOrgansIfEmpty();
  }, []);

  // --- VOICE CAPTURE (EAR) ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (awake && !muted) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setListening(true);
      recognition.onend = () => {
        setListening(false);
        // Auto-restart if still awake and not muted
        if (awake && !muted) {
          try { recognition.start(); } catch (e) { /* already started */ }
        }
      };
      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setListening(false);
      };
      recognition.onresult = async (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            const text = result[0].transcript;
            const confidence = result[0].confidence || 0;

            // Store heard utterance
            const utt = await Utterance.create({
              timestamp: new Date().toISOString(),
              direction: 'heard',
              text,
              confidence,
              session_id: sessionId
            });
            setUtterances(prev => [...prev, utt]);
            markInvoked('EAR');

            // Call the brain — it will return NOT_IMPLEMENTED
            await callBrain({
              modality: 'voice',
              transcript: text,
              frame_ref: null,
              requested_capability: 'respond'
            });
          }
        }
      };

      recognitionRef.current = recognition;
      try { recognition.start(); } catch (e) { /* already started */ }
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
        recognitionRef.current = null;
      }
      setListening(false);
    };
  }, [awake, muted, sessionId]);

  // --- SPEAK-BACK (MOUTH) ---
  const handleSpeak = async () => {
    if (!speakText.trim()) return;

    if (!muted && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(speakText);
      window.speechSynthesis.speak(utterance);
    }

    const utt = await Utterance.create({
      timestamp: new Date().toISOString(),
      direction: 'spoken',
      text: speakText,
      confidence: 1.0,
      session_id: sessionId
    });
    setUtterances(prev => [...prev, utt]);
    markInvoked('MOUTH');
    setSpeakText('');
  };

  // --- CAMERA (EYE) ---
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (e) {
      console.error('Camera access denied:', e);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureFrame = async () => {
    if (!videoRef.current || !streamRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
    if (!blob) return;

    // Upload the blob using Base44 file upload
    const file = new File([blob], `frame_${Date.now()}.jpg`, { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Use the Base44 SDK upload utility
      const { UploadFile } = await import('@/api/upload');
      const result = await UploadFile(file);
      const imageUrl = result.file_url || result.url || result;

      await Frame.create({
        timestamp: new Date().toISOString(),
        image_url: imageUrl,
        source: 'front',
        session_id: sessionId,
        notes: ''
      });
      markInvoked('EYE');
    } catch (e) {
      console.error('Frame upload failed:', e);
    }
  };

  // --- DEVICE STATE (PROPRIOCEPTION) ---
  useEffect(() => {
    let batteryObj = null;
    let intervalId = null;

    const updateAndStoreState = async () => {
      const batteryLevel = batteryObj ? batteryObj.level * 100 : null;
      const newState = {
        battery: batteryLevel,
        charging: batteryObj ? batteryObj.charging : false,
        online: navigator.onLine,
        orientation: deviceState.orientation,
        permissions: deviceState.permissions
      };
      setDeviceState(prev => ({ ...prev, ...newState }));

      try {
        await DeviceState.create({
          timestamp: new Date().toISOString(),
          battery: batteryLevel ?? -1,
          online: navigator.onLine,
          permissions: deviceState.permissions,
          session_id: sessionId
        });
        markInvoked('PROPRIOCEPTION');
      } catch (e) { /* ignore */ }
    };

    // Battery API
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        batteryObj = battery;
        battery.addEventListener('levelchange', updateAndStoreState);
        battery.addEventListener('chargingchange', updateAndStoreState);
      });
    }

    // Online/offline events
    const handleOnline = () => setDeviceState(prev => ({ ...prev, online: true }));
    const handleOffline = () => setDeviceState(prev => ({ ...prev, online: false }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Device orientation
    const handleOrientation = (e) => {
      if (e.alpha !== null || e.beta !== null || e.gamma !== null) {
        setDeviceState(prev => ({
          ...prev,
          orientation: { alpha: e.alpha, beta: e.beta, gamma: e.gamma }
        }));
      }
    };
    window.addEventListener('deviceorientation', handleOrientation);

    // Permissions
    const checkPermissions = async () => {
      const perms = {};
      try {
        const micPerm = await navigator.permissions.query({ name: 'microphone' });
        perms.microphone = micPerm.state;
      } catch (e) {}
      try {
        const camPerm = await navigator.permissions.query({ name: 'camera' });
        perms.camera = camPerm.state;
      } catch (e) {}
      setDeviceState(prev => ({ ...prev, permissions: perms }));
    };
    checkPermissions();

    // Poll every 30 seconds
    intervalId = setInterval(updateAndStoreState, 30000);

    return () => {
      if (batteryObj) {
        batteryObj.removeEventListener('levelchange', updateAndStoreState);
        batteryObj.removeEventListener('chargingchange', updateAndStoreState);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('deviceorientation', handleOrientation);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // --- BRAIN CALL ---
  const callBrain = async (extra) => {
    const envelope = {
      request_id: generateRequestId(),
      timestamp: new Date().toISOString(),
      modality: extra.modality || 'text',
      transcript: extra.transcript || null,
      frame_ref: extra.frame_ref || null,
      device_state: {
        battery: deviceState.battery,
        online: deviceState.online,
        orientation: deviceState.orientation
      },
      recent_memory: utterances.slice(-5).map(u => ({
        direction: u.direction,
        text: u.text,
        timestamp: u.timestamp
      })),
      requested_capability: extra.requested_capability || 'unknown'
    };

    const response = await think(envelope);

    await BrainCall.create({
      request_id: envelope.request_id,
      timestamp: envelope.timestamp,
      envelope,
      response,
      status: response.status
    });
    markInvoked('BRAIN');

    setLastBrainResult(response);
  };

  // --- LOAD EXISTING UTTERANCES ---
  useEffect(() => {
    const loadUtterances = async () => {
      try {
        const records = await Utterance.filter({ session_id: sessionId });
        if (records && records.length > 0) {
          setUtterances(records.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
        }
      } catch (e) { /* ignore */ }
    };
    loadUtterances();
  }, [sessionId]);

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [utterances]);

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">JARVIS — BODY CONSOLE</h1>
        <Activity className="w-5 h-5 text-muted-foreground" />
      </div>

      {/* Voice Gate Controls */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant={awake ? "default" : "outline"}
              size="icon"
              onClick={() => setAwake(!awake)}
            >
              <Power className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium">{awake ? 'AWAKE' : 'ASLEEP'}</span>

            <Button
              variant={muted ? "destructive" : "outline"}
              size="icon"
              onClick={() => setMuted(!muted)}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <span className="text-sm">{muted ? 'MUTED' : 'UNMUTED'}</span>
          </div>

          <div className="flex items-center gap-2">
            <Circle
              className={`w-3 h-3 ${listening ? 'fill-green-500 text-green-500' : muted ? 'fill-red-500 text-red-500' : 'fill-gray-400 text-gray-400'}`}
            />
            <span className="text-xs text-muted-foreground">
              {listening ? 'LISTENING' : muted ? 'MUTED' : 'IDLE'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Camera Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold">CAMERA</h2>
            <div className="flex gap-2">
              <Button
                variant={cameraActive ? "destructive" : "outline"}
                size="sm"
                onClick={cameraActive ? stopCamera : startCamera}
              >
                {cameraActive ? <CameraOff className="w-4 h-4 mr-1" /> : <Camera className="w-4 h-4 mr-1" />}
                {cameraActive ? 'Stop' : 'Start'}
              </Button>
              {cameraActive && (
                <Button size="sm" onClick={captureFrame}>
                  Capture Frame
                </Button>
              )}
            </div>
          </div>
          <div className="rounded-lg overflow-hidden bg-black aspect-video">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                Camera off
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Device State Strip */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="flex items-center gap-1">
          {deviceState.online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {deviceState.online ? 'ONLINE' : 'OFFLINE'}
        </Badge>
        <Badge variant="outline">
          BAT: {deviceState.battery !== null ? `${Math.round(deviceState.battery)}%` : 'N/A'}
        </Badge>
        {deviceState.orientation && (
          <Badge variant="outline">
            ORIENT: {Math.round(deviceState.orientation.alpha || 0)}°
          </Badge>
        )}
        {deviceState.permissions.microphone && (
          <Badge variant="outline">
            MIC: {deviceState.permissions.microphone}
          </Badge>
        )}
        {deviceState.permissions.camera && (
          <Badge variant="outline">
            CAM: {deviceState.permissions.camera}
          </Badge>
        )}
      </div>

      {/* Running Transcript */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">TRANSCRIPT</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48" ref={scrollRef}>
            <div className="space-y-2">
              {utterances.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No utterances logged this session.
                </p>
              )}
              {utterances.map((u, i) => (
                <div key={u.id || i} className="flex gap-2 text-sm">
                  <span className="text-muted-foreground text-xs whitespace-nowrap pt-0.5">
                    {new Date(u.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-xs">{u.direction === 'heard' ? '←' : '→'}</span>
                  <span className="flex-1">{u.text}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Speak-Back Field */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              value={speakText}
              onChange={(e) => setSpeakText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSpeak()}
              placeholder="Type text to speak..."
              disabled={muted}
            />
            <Button onClick={handleSpeak} disabled={muted || !speakText.trim()}>
              Speak
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Brain Status Area */}
      {lastBrainResult && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">BRAIN STATUS</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-mono">BRAIN: {lastBrainResult.brain} — no response generated.</p>
              <p className="text-xs mt-1">request_id: {lastBrainResult.request_id}</p>
              <p className="text-xs">reason: {lastBrainResult.reason}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
