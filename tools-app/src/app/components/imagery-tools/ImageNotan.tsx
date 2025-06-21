import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, Download, FileImage } from 'lucide-react';
import PrimaryButton from '../global/PrimaryButton';

interface ImageNotanProps {
  onBack?: () => void;
}

interface NotanSettings {
  contrast: number;
  brightness: number;
  threshold: number;
  invert: boolean;
}

const ImageNotan: React.FC<ImageNotanProps> = ({ onBack }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [notanSettings, setNotanSettings] = useState<NotanSettings>({
    contrast: 150,
    brightness: 100,
    threshold: 128,
    invert: false
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement>(null);

  // Process image with notan effect
  const processImage = useCallback(() => {
    if (!originalImageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = originalImageRef.current;

    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Apply brightness and contrast first
    ctx.filter = `brightness(${notanSettings.brightness}%) contrast(${notanSettings.contrast}%)`;
    ctx.drawImage(img, 0, 0);

    // Get image data for pixel manipulation
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Apply notan effect (convert to high contrast black and white)
    for (let i = 0; i < data.length; i += 4) {
      // Convert to grayscale using luminance formula
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      
      // Apply threshold for notan effect
      const value = gray > notanSettings.threshold ? 255 : 0;
      
      // Apply invert if enabled
      const finalValue = notanSettings.invert ? 255 - value : value;
      
      // Set RGB to the same value (grayscale)
      data[i] = finalValue;     // Red
      data[i + 1] = finalValue; // Green
      data[i + 2] = finalValue; // Blue
      // Alpha stays the same (data[i + 3])
    }

    // Put the processed image data back
    ctx.filter = 'none';
    ctx.putImageData(imageData, 0, 0);

    // Convert canvas to data URL and update state
    const processedDataUrl = canvas.toDataURL('image/png');
    setProcessedImageUrl(processedDataUrl);
  }, [notanSettings]);

  // Process image whenever settings change
  useEffect(() => {
    if (originalImageUrl && originalImageRef.current?.complete) {
      processImage();
    }
  }, [notanSettings, processImage]);

  // Handle image load
  const handleImageLoad = useCallback(() => {
    processImage();
  }, [processImage]);

  // Read and create preview of the uploaded image file
  useEffect(() => {
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setOriginalImageUrl(imageUrl);
        setProcessedImageUrl(null);
      };
      reader.readAsDataURL(uploadedFile);
    } else {
      setOriginalImageUrl(null);
      setProcessedImageUrl(null);
    }
  }, [uploadedFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      setUploadedFile(imageFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setUploadedFile(file);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setOriginalImageUrl(null);
    setProcessedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSettingChange = (setting: keyof NotanSettings, value: number | boolean) => {
    setNotanSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleDownload = () => {
    if (!processedImageUrl) return;
    
    const link = document.createElement('a');
    link.href = processedImageUrl;
    link.download = `${uploadedFile?.name.replace(/\.[^/.]+$/, '') || 'notan'}_notan.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If no file is uploaded, show the upload interface
  if (!uploadedFile) {
    return (
      <div className="flex flex-col h-full max-h-full overflow-hidden gap-8 p-8">
        {/* Header Section */}
        <div className="flex items-start h-[54px] flex-shrink-0">
          <PrimaryButton
            onClick={onBack}
            icon={ChevronLeft}
            iconStrokeWidth={1.67}
            variant="compact"
          >
            Back
          </PrimaryButton>
          
          <div className="flex flex-col gap-2 flex-1 text-center">
            <h1 className="text-2xl font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
              Image Notan
            </h1>
            <p className="text-sm text-[var(--system-color-elevation-base-content-tint)] leading-[1.21]">
              Upload an image to get started
            </p>
          </div>

          <div className="w-[88px] flex-shrink-0"></div>
        </div>

        {/* Upload Area */}
        <div className="flex-1 flex items-center justify-center bg-[var(--system-color-elevation-base-background)] border border-[var(--system-color-border-primary)] rounded-2xl p-6">
          <div 
            className={`flex flex-col items-center gap-6 p-12 border-2 border-dashed rounded-2xl transition-all cursor-pointer w-full max-w-md ${
              isDragging 
                ? 'border-[var(--system-color-border-focus)] bg-[var(--system-color-functional-action-alt)]' 
                : 'border-[var(--system-color-border-secondary)] hover:border-[var(--system-color-border-focus)] hover:bg-[var(--system-color-functional-action-alt)]'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadClick}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <h3 className="text-lg font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
                Drop your image here
              </h3>
              <p className="text-sm text-[var(--system-color-elevation-base-content-tint)] leading-[1.21]">
                or click to browse for an image file
              </p>
              <p className="text-xs text-[var(--system-color-border-secondary)] leading-[1.21]">
                Supports JPG, PNG, WebP, and other image formats
              </p>
            </div>
            
            <PrimaryButton
              icon={FileImage}
              iconStrokeWidth={1.5}
            >
              Choose File
            </PrimaryButton>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  // If file is uploaded, show the notan adjustment interface
  return (
    <div className="flex flex-col h-full max-h-full overflow-hidden gap-8 p-8">
      {/* Header Section */}
      <div className="flex items-start h-[54px] flex-shrink-0">
        <PrimaryButton
          onClick={onBack}
          icon={ChevronLeft}
          iconStrokeWidth={1.67}
          variant="compact"
        >
          Back
        </PrimaryButton>
        
        <div className="flex flex-col gap-2 flex-1 text-center">
          <h1 className="text-2xl font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
            Image Notan
          </h1>
          <p className="text-sm text-[var(--system-color-elevation-base-content-tint)] leading-[1.21]">
            Adjust notan settings for your image
          </p>
        </div>

        <div className="w-[88px] flex-shrink-0"></div>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-6 bg-[var(--system-color-elevation-base-background)] border border-[var(--system-color-border-primary)] rounded-2xl p-6 flex-1 min-h-0 overflow-hidden">
        {/* Left Side - Image Preview Area */}
        <div className="flex flex-col justify-end items-end gap-6 flex-1 min-w-0">
          {/* File Info */}
          <div className="w-full flex items-center justify-between p-4 bg-[var(--system-color-elevation-one-background)] border border-[var(--system-color-border-primary)] rounded-lg">
            <div className="flex items-center gap-3">
              <FileImage size={20} className="text-[var(--system-color-functional-action)]" strokeWidth={1.5} />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
                  {uploadedFile.name}
                </span>
                <span className="text-xs text-[var(--system-color-elevation-base-content-tint)] leading-[1.21]">
                  {(uploadedFile.size / 1024).toFixed(1)} KB • {uploadedFile.type}
                </span>
              </div>
            </div>
            <button 
              onClick={handleRemoveFile}
              className="text-sm text-[var(--system-color-elevation-base-content-tint)] hover:text-[var(--system-color-elevation-base-content)] transition-colors"
            >
              Remove
            </button>
          </div>

          {/* Image Preview */}
          <div className="w-full flex-1 border border-dashed border-[var(--system-color-border-secondary)] rounded-2xl min-h-0 flex items-center justify-center p-8">
            {originalImageUrl ? (
              <div className="w-full h-full flex items-center justify-center relative">
                {/* Hidden original image for processing */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={originalImageRef}
                  src={originalImageUrl}
                  alt="Original"
                  onLoad={handleImageLoad}
                  className="hidden"
                />
                
                {/* Hidden canvas for processing */}
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* Display processed image */}
                {processedImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={processedImageUrl}
                    alt="Notan processed"
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-center text-[var(--system-color-elevation-base-content-tint)]">
                    <p className="text-sm">Processing image...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-[var(--system-color-elevation-base-content-tint)]">
                <p className="text-sm">Loading image...</p>
              </div>
            )}
          </div>
          
          {/* Download Button */}
          <PrimaryButton
            onClick={handleDownload}
            disabled={!processedImageUrl}
            icon={Download}
            iconStrokeWidth={2}
            variant="compact"
          >
            Download Image
          </PrimaryButton>
        </div>

        {/* Right Side - Notan Settings */}
        <div className="flex flex-col gap-6 w-80 flex-shrink-0 overflow-hidden">
          <h2 className="text-base font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21] flex-shrink-0">
            Notan Settings
          </h2>
          
          <div className="flex flex-col gap-6 overflow-y-auto min-h-0 pr-2">
            {/* Contrast */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
                  Contrast
                </label>
                <span className="text-sm text-[var(--system-color-elevation-base-content-tint)] leading-[1.21]">
                  {notanSettings.contrast}%
                </span>
              </div>
              <div className="bg-[var(--system-color-elevation-one-background)] border border-[var(--system-color-border-primary)] rounded-lg p-2">
                <input
                  type="range"
                  min="50"
                  max="300"
                  value={notanSettings.contrast}
                  onChange={(e) => handleSettingChange('contrast', parseInt(e.target.value))}
                  className="w-full h-2 bg-[var(--system-color-border-secondary)] rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Brightness */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
                  Brightness
                </label>
                <span className="text-sm text-[var(--system-color-elevation-base-content-tint)] leading-[1.21]">
                  {notanSettings.brightness}%
                </span>
              </div>
              <div className="bg-[var(--system-color-elevation-one-background)] border border-[var(--system-color-border-primary)] rounded-lg p-2">
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={notanSettings.brightness}
                  onChange={(e) => handleSettingChange('brightness', parseInt(e.target.value))}
                  className="w-full h-2 bg-[var(--system-color-border-secondary)] rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Threshold */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
                  Threshold
                </label>
                <span className="text-sm text-[var(--system-color-elevation-base-content-tint)] leading-[1.21]">
                  {notanSettings.threshold}
                </span>
              </div>
              <div className="bg-[var(--system-color-elevation-one-background)] border border-[var(--system-color-border-primary)] rounded-lg p-2">
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={notanSettings.threshold}
                  onChange={(e) => handleSettingChange('threshold', parseInt(e.target.value))}
                  className="w-full h-2 bg-[var(--system-color-border-secondary)] rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Invert Toggle */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <label className="text-sm font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
                Invert Colors
              </label>
              <div className="flex items-center justify-between w-full bg-[var(--system-color-elevation-one-background)] border border-[var(--system-color-border-primary)] rounded-lg px-4 py-3">
                <span className="text-sm text-[var(--system-color-elevation-base-content-tint)] leading-[1.21]">
                  {notanSettings.invert ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  onClick={() => handleSettingChange('invert', !notanSettings.invert)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notanSettings.invert 
                      ? 'bg-[var(--system-color-functional-action)]' 
                      : 'bg-[var(--system-color-border-secondary)]'
                  }`}
                >
                  <div
                    className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                      notanSettings.invert ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageNotan;
