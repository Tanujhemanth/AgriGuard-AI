'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  MapPin,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  ImageIcon,
  Leaf,
  CheckCircle2,
  FileImage,
} from 'lucide-react';
import { ImageFeatures, LocationData } from '@/types';

interface FieldInputPanelProps {
  onAnalyze: (data: {
    imageUri: string | null;
    location: LocationData;
    imageFeatures?: ImageFeatures;
  }) => void;
  isLoading: boolean;
  currentLocation: LocationData;
}

export const FieldInputPanel: React.FC<FieldInputPanelProps> = ({
  onAnalyze,
  isLoading,
  currentLocation,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; sizeKb: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Camera stream state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to extract image visual features from HTML5 canvas
  const extractImageFeatures = (imgUri: string, fileName?: string): Promise<ImageFeatures> => {
    return new Promise((resolve) => {
      const img = new Image();
      // DO NOT set crossOrigin for base64 data URIs to prevent browser CORS canvas errors
      if (imgUri.startsWith('http')) {
        img.crossOrigin = 'anonymous';
      }

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const width = Math.min(300, img.width || 300);
          const height = Math.min(300, img.height || 300);
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ fileName, aspectRatio: (img.width || 1) / (img.height || 1) });
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const imgData = ctx.getImageData(0, 0, width, height);
          const data = imgData.data;

          let brownPixels = 0;
          let darkPixels = 0;
          let greenPixels = 0;
          let yellowPixels = 0;
          let exgPixels = 0;
          let skinTonePixels = 0;
          let totalLuminance = 0;
          const illuminanceArray: number[] = [];
          const totalPixels = width * height;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            totalLuminance += lum;
            if (i % 32 === 0) illuminanceArray.push(lum);

            // Excess Green Index (ExG = 2*G - R - B) for plant chlorophyll detection
            const exg = 2 * g - r - b;
            if (exg > 10) exgPixels++;

            // Green foliage pixel
            if (g > r * 1.02 && g > b * 1.02) greenPixels++;

            // Yellow chlorotic leaf pixel
            if (r > 100 && g > 90 && b < 110 && Math.abs(r - g) < 45) yellowPixels++;

            // Necrotic / brown lesion spot
            if (r > 90 && g > 50 && r > b + 20) brownPixels++;

            // Dark spot
            if (r + g + b < 120) darkPixels++;

            // Precise Human Skin Tone Detector (High R/G contrast, negative ExG)
            if (
              r > 115 &&
              g > 60 &&
              b > 40 &&
              r > g * 1.2 &&
              r > b * 1.4 &&
              g > b * 1.08 &&
              (r - g) > 22 &&
              exg < -5
            ) {
              skinTonePixels++;
            }
          }

          const avgLum = totalLuminance / totalPixels;
          const variance =
            illuminanceArray.reduce((acc, l) => acc + Math.pow(l - avgLum, 2), 0) /
            (illuminanceArray.length || 1);

          resolve({
            fileName,
            greenPct: greenPixels / totalPixels,
            yellowPct: yellowPixels / totalPixels,
            exgLeafPct: exgPixels / totalPixels,
            brownPct: brownPixels / totalPixels,
            darkPct: darkPixels / totalPixels,
            skinTonePct: skinTonePixels / totalPixels,
            aspectRatio: (img.width || 1) / (img.height || 1),
            luminance: avgLum,
            variance: Math.sqrt(variance),
          });
        } catch (e) {
          console.warn('Canvas feature extraction warning:', e);
          resolve({ fileName, aspectRatio: (img.width || 1) / (img.height || 1) });
        }
      };

      img.onerror = (err) => {
        console.warn('Image load error during feature extraction:', err);
        resolve({ fileName, aspectRatio: 1 });
      };

      img.src = imgUri;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image file size must be under 10MB.');
      return;
    }

    setErrorMsg(null);
    setFileDetails({ name: file.name, sizeKb: Math.round(file.size / 1024) });

    const reader = new FileReader();
    reader.onload = async (event) => {
      const uri = event.target?.result as string;
      setSelectedImage(uri);

      // Extract client-side visual features & auto-analyze
      const features = await extractImageFeatures(uri, file.name);
      onAnalyze({
        imageUri: uri,
        location: currentLocation,
        imageFeatures: features,
      });
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setIsCameraActive(false);
      setErrorMsg('Unable to access camera. Please upload an image file instead.');
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg', 0.92);
      setSelectedImage(dataUri);
      setFileDetails({ name: 'camera_snapshot.jpg', sizeKb: Math.round((dataUri.length * 3) / 4000) });

      const features = await extractImageFeatures(dataUri, 'camera_snapshot.jpg');
      onAnalyze({
        imageUri: dataUri,
        location: currentLocation,
        imageFeatures: features,
      });
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  return (
    <div className="glass-card p-6 lg:p-7 space-y-6 border-2 border-emerald-500/30 shadow-2xl">
      {/* Streamlined Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
            <Leaf className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Automatic Crop & Leaf Pathology Scanner
            </h2>
            <p className="text-xs text-emerald-300/80">
              Upload a crop photo or snap a photo — AI validates image & analyzes species & disease
            </p>
          </div>
        </div>

        {/* Automatic Device GPS Signal Badge */}
        <div className="flex items-center gap-2 bg-emerald-950 px-4 py-2.5 rounded-xl border border-emerald-500/40 text-xs shadow-md">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-white">
                {currentLocation.displayName || `${currentLocation.latitude.toFixed(2)}°N, ${currentLocation.longitude.toFixed(2)}°E`}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-1" />
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-semibold">Device Location Auto-Detected</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Camera View Modal/Overlay */}
      {isCameraActive ? (
        <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-emerald-500 flex flex-col items-center shadow-2xl">
          <video ref={videoRef} autoPlay playsInline className="w-full h-72 object-cover" />
          <div className="p-4 bg-emerald-950/90 w-full flex items-center justify-center gap-4 border-t border-emerald-500/30">
            <button
              type="button"
              onClick={capturePhoto}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg"
            >
              <Camera className="w-4 h-4" /> Snap & Validate Image
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2.5 bg-rose-900/60 hover:bg-rose-900 text-rose-200 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Single Clean Scanner Container */
        <div className="relative border-2 border-dashed border-emerald-500/40 rounded-2xl p-6 text-center bg-emerald-950/40 hover:border-emerald-400 transition min-h-[220px] flex flex-col items-center justify-center shadow-inner">
          {selectedImage ? (
            <div className="relative w-full flex flex-col items-center space-y-3">
              <div className="relative max-h-56 rounded-xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl">
                {/* eslint-disable-next-html-element-suppress */}
                <img src={selectedImage} alt="Selected Image Preview" className="max-h-52 w-auto object-contain rounded-lg" />
                {isLoading && (
                  <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-xs flex items-center justify-center text-xs font-black text-amber-300 gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-amber-400" /> Stage 1: Validating Image Content...
                  </div>
                )}
              </div>

              {/* Selected Image Metadata Badge (Requirement 12) */}
              {fileDetails && (
                <div className="flex items-center gap-2 bg-emerald-950/80 px-3.5 py-1.5 rounded-full border border-emerald-500/30 text-xs font-mono text-emerald-200 shadow">
                  <FileImage className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-white truncate max-w-[200px]">{fileDetails.name}</span>
                  <span className="text-emerald-400/80">({fileDetails.sizeKb} KB)</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 text-xs bg-emerald-800/80 hover:bg-emerald-700 disabled:opacity-50 text-emerald-100 rounded-xl flex items-center gap-1.5 border border-emerald-500/30 font-bold shadow"
                >
                  <Upload className="w-4 h-4" /> Upload New Photo
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={startCamera}
                  className="px-4 py-2 text-xs bg-emerald-800/80 hover:bg-emerald-700 disabled:opacity-50 text-emerald-100 rounded-xl flex items-center gap-1.5 border border-emerald-500/30 font-bold shadow"
                >
                  <Camera className="w-4 h-4 text-amber-400" /> Camera Snap
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Upload Crop / Leaf Photo</h3>
                <p className="text-xs text-emerald-300/80 mt-0.5">
                  Multi-stage AI validation detects invalid objects (faces, cars, buildings) before crop diagnosis
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-emerald-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg"
                >
                  <ImageIcon className="w-4 h-4" /> Select Leaf Image
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={startCamera}
                  className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50 text-emerald-200 border border-emerald-500/30 text-xs font-black rounded-xl flex items-center gap-2 shadow"
                >
                  <Camera className="w-4 h-4 text-amber-400" /> Open Camera
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Auto-Detection Status Banner */}
      <div className="p-3 rounded-xl bg-emerald-900/30 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
        <span className="font-semibold text-emerald-200 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" /> 2-Stage AI Pipeline:
        </span>
        <span className="px-3 py-1 rounded-full bg-emerald-950 text-amber-300 border border-emerald-500/30 font-black text-[11px] flex items-center gap-1 shadow">
          Stage 1: Content Validation → Stage 2: Crop Analysis
        </span>
      </div>
    </div>
  );
};
