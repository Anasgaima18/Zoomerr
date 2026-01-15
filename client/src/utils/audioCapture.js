import { useState, useRef, useCallback } from 'react';

// Worklet code as a string to avoid external file dependencies in this simple setup
const workletCode = `
class PCMProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input && input.length > 0) {
      const inputData = input[0];
      
      // Convert Float32 to Int16 PCM
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      
      // Post buffer to main thread
      this.port.postMessage(pcmData);
    }
    return true;
  }
}
registerProcessor('pcm-processor', PCMProcessor);
`;

export const useAudioCapture = () => {
    const [isCapturing, setIsCapturing] = useState(false);
    const [error, setError] = useState(null);
    const streamRef = useRef(null);
    const audioContextRef = useRef(null);
    const workletNodeRef = useRef(null);
    const sourceRef = useRef(null);

    const startCapture = useCallback(async (onAudioData) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            audioContextRef.current = audioContext;

            // Load worklet
            const blob = new Blob([workletCode], { type: 'application/javascript' });
            const workletUrl = URL.createObjectURL(blob);
            await audioContext.audioWorklet.addModule(workletUrl);

            const source = audioContext.createMediaStreamSource(stream);
            sourceRef.current = source;

            const workletNode = new AudioWorkletNode(audioContext, 'pcm-processor');
            workletNodeRef.current = workletNode;

            workletNode.port.onmessage = (event) => {
                const pcmData = event.data;
                // Convert to base64 string
                let binary = '';
                const bytes = new Uint8Array(pcmData.buffer);
                const len = bytes.byteLength;
                for (let i = 0; i < len; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                const base64Chunk = btoa(binary);

                // Callback with base64 data
                onAudioData(base64Chunk);
            };

            source.connect(workletNode);
            // AudioWorkletNode doesn't necessarily need to connect to destination if not playing back
            // but keeps the graph active. Connect to destination if silence is mostly fine, 
            // or leave unconnected if the browser allows (most modern ones do).
            // workletNode.connect(audioContext.destination);

            setIsCapturing(true);
            setError(null);
        } catch (err) {
            console.error('Error starting audio capture:', err);
            setError(err);
            setIsCapturing(false);
        }
    }, []);

    const stopCapture = useCallback(() => {
        if (workletNodeRef.current) {
            workletNodeRef.current.disconnect();
            workletNodeRef.current = null;
        }
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCapturing(false);
    }, []);

    return { startCapture, stopCapture, isCapturing, error };
};
