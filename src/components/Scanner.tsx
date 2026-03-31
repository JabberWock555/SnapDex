import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, Aperture } from 'lucide-react';

interface ScannerProps {
  onCapture: (base64Image: string) => void;
  isProcessing: boolean;
  capturedImage?: string;
}

export default function Scanner({ onCapture, isProcessing, capturedImage }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setHasPermission(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasPermission(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    
    if (vw === 0 || vh === 0) return;

    // The container has an aspect ratio of 1.75:1
    const targetRatio = 1.75;
    let sWidth, sHeight, sx, sy;

    // Calculate the crop area to match the object-fit: cover behavior
    if (vw / vh > targetRatio) {
      // Video is wider than target ratio
      sHeight = vh;
      sWidth = vh * targetRatio;
      sx = (vw - sWidth) / 2;
      sy = 0;
    } else {
      // Video is taller than target ratio
      sWidth = vw;
      sHeight = vw / targetRatio;
      sx = 0;
      sy = (vh - sHeight) / 2;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = sWidth;
    canvas.height = sHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw only the cropped portion
    ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);
    onCapture(base64Image);
  };

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-[#181818] rounded-2xl m-4">
        <Camera className="w-12 h-12 text-gray-500 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Camera Access Denied</h3>
        <p className="text-gray-400 mb-4">Please allow camera access to scan business cards.</p>
        <button 
          onClick={startCamera}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-between pt-8 pb-8 px-4">
      <div className="text-center mb-6">
        <h2 className="text-lg font-medium text-white">Scan Business Card</h2>
        <p className="text-sm text-gray-400">Align the card within the frame</p>
      </div>

      {/* Card-shaped Camera View */}
      <div className="w-full max-w-md aspect-[1.75/1] relative rounded-2xl overflow-hidden shadow-2xl bg-black border border-gray-800 flex-shrink-0">
        {isProcessing && capturedImage ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#171717]/80 backdrop-blur-sm">
            <img src={capturedImage} alt="Processing" className="absolute inset-0 w-full h-full object-cover opacity-30" />
            <div className="relative z-30 flex flex-col items-center">
              <Aperture className="w-10 h-10 text-blue-500 animate-spin mb-4" />
              <p className="text-white font-medium mb-3">Extracting Details...</p>
              <div className="w-48 h-1.5 bg-gray-800 rounded-full overflow-hidden relative">
                <div className="absolute top-0 left-0 h-full w-1/2 bg-blue-500 rounded-full animate-indeterminate"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Corner guides */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-white/80 rounded-tl-lg"></div>
            <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-white/80 rounded-tr-lg"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-white/80 rounded-bl-lg"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-white/80 rounded-br-lg"></div>
          </>
        )}
      </div>

      {/* Controls - Pushed to bottom */}
      <div className="mt-auto pt-8 flex justify-center w-full">
        <button
          onClick={handleCapture}
          disabled={isProcessing || !hasPermission}
          className="relative group flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-blue-600 rounded-full opacity-20 group-hover:opacity-30 group-active:opacity-40 transition-opacity scale-150"></div>
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-xl transform transition-transform group-hover:scale-105 group-active:scale-95 border-4 border-[#171717]">
            <Camera className="w-8 h-8 text-white" />
          </div>
        </button>
      </div>
    </div>
  );
}
